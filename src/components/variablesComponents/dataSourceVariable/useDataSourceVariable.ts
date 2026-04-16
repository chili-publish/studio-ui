import {
    ConnectorDataSourceVariableSource,
    DataSourceVariable,
    DataSourceVariableSource,
    DataSourceVariableSourceType,
    InjectedDataSourceVariableSource,
} from '@chili-publish/studio-sdk';
import { DataItem, DataSourceVariableDataModel } from '@chili-publish/studio-sdk/connector-types/src';
import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getPage, getPageItemById } from 'src/components/shared/DataSource/dataSource.util';
import useSharedDataSource from 'src/components/shared/DataSource/useSharedDataSource';
import { useUiConfigContext } from 'src/contexts/UiConfigContext';
import { useAppDispatch } from 'src/store';
import { PanelType, selectActivePanel } from 'src/store/reducers/panelReducer';
import { validateVariable } from 'src/store/reducers/variableReducer';

interface IUseDataSourceVariable {
    variable: DataSourceVariable;
}
const isInjected = (value: DataSourceVariableSource): value is InjectedDataSourceVariableSource => {
    return value.type === DataSourceVariableSourceType.injected;
};
const useDataSourceVariable = (props: IUseDataSourceVariable) => {
    const { variable } = props;
    const activePanel = useSelector(selectActivePanel);

    const { projectConfig } = useUiConfigContext();
    const dispatch = useAppDispatch();

    const [connectorReady, setConnectorReady] = useState(false);
    const rowKeyNameRef = useRef<string | null>(null);

    // for table mode
    const [isDataSourceModalOpen, setIsDataSourceModalOpen] = useState(false);
    // for list mode
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean | null>(null);

    const connectorId = (variable.value as ConnectorDataSourceVariableSource)?.connectorId;

    const deduplicateRows = useCallback((newRows: DataItem[], existingRows: DataItem[]) => {
        const rowKey = rowKeyNameRef.current;
        if (rowKey) {
            const existingKeys = new Set(existingRows.map((row) => row?.[rowKey]?.toString()));
            return newRows.filter((row: DataItem) => {
                const k = row?.[rowKey]?.toString();
                if (k === undefined) return true;
                if (existingKeys.has(k)) return false;
                existingKeys.add(k);
                return true;
            });
        }
        return newRows;
    }, []);

    const getPageItem = async (entryId: string) => {
        if (variable.value && isInjected(variable.value)) {
            return window.StudioUISDK.variable.dataSource.getInjectedItemById(variable.id, entryId);
        }
        return getPageItemById(connectorId ?? '', entryId);
    };

    const getDataSourcePage = (pageConfig: {
        continuationToken?: string | null;
        previousPageToken?: string | null;
    }) => {
        if (variable.value && isInjected(variable.value)) {
            return window.StudioUISDK.variable.dataSource.getInjectedData(variable.id);
        }
        return getPage(connectorId ?? '', pageConfig);
    };

    const {
        currentDataRow,

        updateSelectedRow,
        dataRows,

        isPrevDisabled,
        isNextDisabled,

        isNextPageLoading,
        isPreviousPageLoading,

        hasPreviousPage,
        hasNextPage,

        getPreviousRow,
        getNextRow,

        loadBySelectedItem,
        loadDataRowsByToken,

        ...sharedDataSourceProps
    } = useSharedDataSource({
        connectorId,
        deduplicateRows: deduplicateRows,
        getPageItemById: getPageItem,
        getPage: getDataSourcePage,
    });

    const getRowIdPropName = useCallback(async () => {
        if (variable.value && isInjected(variable.value)) {
            const injectedVariable = variable.value as InjectedDataSourceVariableSource;
            rowKeyNameRef.current = injectedVariable.itemIdPropertyName;
            return;
        }

        if (connectorReady && connectorId && !rowKeyNameRef.current) {
            const model = await window.StudioUISDK.dataConnector.getModel(connectorId);
            rowKeyNameRef.current = (model.parsedData as DataSourceVariableDataModel)?.itemIdPropertyName;
        }
    }, [connectorId, connectorReady, variable.value]);

    const loadPreselectedRow = useEffectEvent((entryId: string) => {
        if (!isNextPageLoading && !isPreviousPageLoading) {
            loadBySelectedItem(entryId);
        }
    });

    const loadData = useEffectEvent((entryId?: string) => {
        if (entryId) {
            // if a row is already preselected, load the row if the data is not loaded yet
            loadPreselectedRow(entryId);
            return;
        } else {
            // preselect the first row if no entryId is set
            loadDataRowsByToken({ continuationToken: null }, { preselectFirstRow: true });
            return;
        }
    });

    useEffect(() => {
        getRowIdPropName();
    }, [getRowIdPropName]);

    useEffect(() => {
        (async () => {
            if (currentDataRow) {
                const value = rowKeyNameRef.current ? currentDataRow[rowKeyNameRef.current]?.toString() : undefined;

                if (!value || value === variable.entryId) return;

                dispatch(validateVariable({ ...variable, entryId: value } as DataSourceVariable));
                projectConfig?.onVariableValueChangedCompleted?.(variable.id, value as string);
                await window.StudioUISDK.variable.dataSource.setValue(variable.id, value);
            }
        })();
    }, [currentDataRow, variable.id, dispatch, projectConfig, variable]);

    const loadDataForConnectorSource = useEffectEvent(() => {
        if (!connectorReady) {
            return;
        }

        const isConnector = variable.value?.type === DataSourceVariableSourceType.connector;
        if (!isConnector) {
            return;
        }

        if (!dataRows.length) {
            loadData(variable.entryId);
        }
    });

    useEffect(() => {
        loadDataForConnectorSource();
    }, [connectorReady, dataRows.length]);

    useEffect(() => {
        if (variable.value && !isInjected(variable.value)) {
            return;
        }
        // for injected source, load data when component open as the data is injected manually by the user
        // and there is no event to trigger the data reload
        const listModeOpenOnMobile = activePanel === PanelType.DATA_SOURCE_VARIABLE_LIST_MODE;
        const tableModeOpenOnMobile = activePanel === PanelType.DATA_SOURCE_VARIABLE_TABLE_MODE;
        const openOnMobile = listModeOpenOnMobile || tableModeOpenOnMobile;
        const openOnDesktop = isDropdownOpen || isDataSourceModalOpen;

        if (!dataRows.length && (openOnMobile || openOnDesktop)) {
            loadData(variable.entryId);
        }
    }, [variable, activePanel, isDropdownOpen, isDataSourceModalOpen, dataRows.length]);

    useEffect(() => {
        const checkConnectorState = async () => {
            const connectorState = await window.StudioUISDK.connector.getState(connectorId);
            if (connectorState.parsedData?.type !== 'ready') {
                await window.StudioUISDK.connector.waitToBeReady(connectorId, 20000);
                setConnectorReady(true);
            } else {
                setConnectorReady(true);
            }
        };
        checkConnectorState();
    }, [connectorId]);

    return {
        isDataSourceModalOpen,
        setIsDataSourceModalOpen,

        isDropdownOpen,
        setIsDropdownOpen,

        updateSelectedRow,
        currentDataRow,
        // eslint-disable-next-line react-hooks/refs
        currentRowKey: rowKeyNameRef.current ?? '',
        dataRows,

        isPrevDisabled,
        isNextDisabled,

        isNextPageLoading,
        isPreviousPageLoading,

        hasPreviousPage,
        hasNextPage,

        getPreviousRow,
        getNextRow,

        ...sharedDataSourceProps,
    };
};

export default useDataSourceVariable;

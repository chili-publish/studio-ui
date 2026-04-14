import {
    ConnectorDataSourceVariableSource,
    ConnectorEvent,
    ConnectorEventType,
    DataSourceVariable,
} from '@chili-publish/studio-sdk';
import { DataItem, DataSourceVariableDataModel } from '@chili-publish/studio-sdk/connector-types/src';
import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import useSharedDataSource from 'src/components/shared/DataSource/useSharedDataSource';
import { useUiConfigContext } from 'src/contexts/UiConfigContext';
import { useAppDispatch } from 'src/store';
import { validateVariable } from 'src/store/reducers/variableReducer';

interface IUseDataSourceVariable {
    variable: DataSourceVariable;
}
const useDataSourceVariable = (props: IUseDataSourceVariable) => {
    const { variable } = props;
    const { projectConfig } = useUiConfigContext();
    const dispatch = useAppDispatch();
    const rowKeyNameRef = useRef<string | null>(null);

    const [isDataSourceModalOpen, setIsDataSourceModalOpen] = useState(false);
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

        resetData,
        shouldUpdateDataRow,

        loadBySelectedItem,
        loadDataRowsByToken,

        ...sharedDataSourceProps
    } = useSharedDataSource({ connectorId, deduplicateRows: deduplicateRows });

    const getKeyPropertyName = useCallback(async () => {
        if (connectorId && !rowKeyNameRef.current) {
            const model = await window.StudioUISDK.dataConnector.getModel(connectorId);
            rowKeyNameRef.current = (model.parsedData as DataSourceVariableDataModel)?.itemIdPropertyName;
        }
    }, [connectorId]);

    useEffect(() => {
        if (connectorId) {
            getKeyPropertyName();
        }
    }, [connectorId, getKeyPropertyName]);

    useEffect(() => {
        (async () => {
            if (currentDataRow && shouldUpdateDataRow.current) {
                const value = rowKeyNameRef.current ? currentDataRow[rowKeyNameRef.current]?.toString() : undefined;

                if (!value) return;

                dispatch(validateVariable({ ...variable, entryId: value } as DataSourceVariable));
                projectConfig?.onVariableValueChangedCompleted?.(variable.id, value as string);
                await window.StudioUISDK.variable.dataSource.setValue(variable.id, value);
            }
        })();
    }, [currentDataRow, variable.id, shouldUpdateDataRow]);

    useEffect(() => {
        const handler = (event: ConnectorEvent) => {
            if (event.type === ConnectorEventType.reloadRequired && event.id === connectorId) {
                resetData();
                getKeyPropertyName();

                if (variable.entryId) loadBySelectedItem(connectorId ?? '', variable.entryId);
            }
        };
        const unsubscribe = window.StudioUISDK.config.events.onConnectorEvent.registerCallback(handler);
        return () => {
            unsubscribe();
        };
    }, [connectorId, resetData, variable.entryId, getKeyPropertyName, loadBySelectedItem]);

    const loadPreselectedRow = useEffectEvent((entryId: string) => {
        if (entryId && !dataRows.length && !isNextPageLoading && !isPreviousPageLoading) {
            loadBySelectedItem(connectorId ?? '', entryId);
        }
    });
    useEffect(() => {
        // if a row is already preselected, load the row if the data is not loaded yet
        if (!dataRows.length) {
            if (variable.entryId) {
                loadPreselectedRow(variable.entryId);
                return;
            } else {
                // preselect the first row if no entryId is set
                loadDataRowsByToken(connectorId ?? '', { continuationToken: null }, { preselectFirstRow: true });
                return;
            }
        }
    }, [isDataSourceModalOpen, connectorId, variable, dataRows.length, loadDataRowsByToken, loadBySelectedItem]);

    return {
        isDataSourceModalOpen,
        setIsDataSourceModalOpen,

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

import { ConnectorEvent, ConnectorEventType } from '@chili-publish/studio-sdk';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/AppProvider';
import { useSubscriberContext } from '../../contexts/Subscriber';
import { useAppDispatch } from '../../store';
import { validateVariableList } from '../../store/reducers/variableReducer';
import { useVariableHistory } from './useVariableHistory';
import useSharedDataSource from '../shared/DataSource/useSharedDataSource';

export const SELECTED_ROW_INDEX_KEY = 'DataSourceSelectedRowIdex';

const useDataSource = () => {
    const { dataSource } = useAppContext();
    const {
        currentRowIndex,
        currentDataRow,

        isNextPageLoading,
        hasNextPage,

        updateSelectedRow,

        loadDataRowsByToken,
        resetData,

        processingDataRow,
        onProcessingDataRowChange,
        shouldUpdateDataRow,
        ...sharedDataSourceProps
    } = useSharedDataSource({ connectorId: dataSource?.id });

    const dispatch = useAppDispatch();

    const { subscriber } = useSubscriberContext();

    const [prevDataRowIndex, setPrevDataRowIndex] = useState(currentRowIndex);
    const { hasChanged: variablesChanged } = useVariableHistory();

    // keep track of the change of dataRow in order to be able to trigger variable validation
    // when the source of variable change comes from the undo/redo actions
    if (prevDataRowIndex !== currentRowIndex) {
        setPrevDataRowIndex(currentRowIndex);
    }

    useEffect(() => {
        if (dataSource) {
            loadDataRowsByToken(dataSource.id, { continuationToken: null }, { preselectFirstRow: true });
        }
    }, [dataSource, loadDataRowsByToken]);

    useEffect(() => {
        (async () => {
            if (currentDataRow && shouldUpdateDataRow.current) {
                await window.StudioUISDK.dataSource.setDataRow(currentDataRow);
            }
        })();
    }, [currentDataRow, shouldUpdateDataRow]);

    useEffect(() => {
        (async () => {
            if (!dataSource) return;
            onProcessingDataRowChange(currentRowIndex);
            await window.StudioUISDK.undoManager.addCustomData(SELECTED_ROW_INDEX_KEY, `${currentRowIndex}`);
        })();
    }, [currentRowIndex, dataSource, onProcessingDataRowChange]);

    useEffect(() => {
        const handler = (undoData: Record<string, string>) => {
            if (undoData[SELECTED_ROW_INDEX_KEY]) {
                const index = Number(undoData[SELECTED_ROW_INDEX_KEY]);
                // We prevent calling of `.setDataRow` for undo/redo calls (in this case index !== currentRowIndex)
                // to not create an extra undo item with same dataRow changes
                shouldUpdateDataRow.current = index === currentRowIndex;
                if (processingDataRow.current === index) processingDataRow.current = null;
                updateSelectedRow(index);
            }
        };
        subscriber?.on('onCustomUndoDataChanged', handler);
        return () => subscriber?.off('onCustomUndoDataChanged', handler);
    }, [subscriber, updateSelectedRow, currentRowIndex]);

    useEffect(() => {
        const handler = (event: ConnectorEvent) => {
            if (event.type === ConnectorEventType.reloadRequired && event.id === dataSource?.id) {
                resetData();
                loadDataRowsByToken(dataSource.id, { continuationToken: null });
            }
        };
        subscriber?.on('onConnectorEvent', handler);
        return () => subscriber?.off('onConnectorEvent', handler);
    }, [subscriber, dataSource, resetData, loadDataRowsByToken]);

    useEffect(() => {
        // In order to run "dirty" validation of variables at the right time,
        // we check the ref that will be updated only after the execution of the `setDataRow` method above.
        // The result of setDataRow leads to changing the variables, which will lead to the re-execution of this useEffect,
        // since validateVariables is a callback that has a dependency on the "variables" value.
        if (variablesChanged && currentDataRow) {
            dispatch(validateVariableList());
        }
    }, [currentDataRow, variablesChanged, dispatch]);

    return {
        currentRowIndex,
        isLoading: isNextPageLoading,
        hasMoreRows: hasNextPage,
        updateSelectedRow,

        loadDataRowsByToken,

        hasDataConnector: !!dataSource,

        ...sharedDataSourceProps,
    };
};

export default useDataSource;

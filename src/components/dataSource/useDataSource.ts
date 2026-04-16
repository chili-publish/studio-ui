import { ConnectorEvent, ConnectorEventType } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/AppProvider';
import { useSubscriberContext } from '../../contexts/Subscriber';
import useSharedDataSource from '../shared/DataSource/useSharedDataSource';
import { getPage } from '../shared/DataSource/dataSource.util';

export const SELECTED_ROW_INDEX_KEY = 'DataSourceSelectedRowIdex';

const useDataSource = () => {
    const { dataSource } = useAppContext();

    const getPageFn = useCallback(
        (pageConfig: { continuationToken?: string | null; previousPageToken?: string | null }) =>
            getPage(dataSource?.id ?? '', pageConfig),
        [dataSource?.id],
    );
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
    } = useSharedDataSource({
        connectorId: dataSource?.id,
        getPage: getPageFn,
    });

    const { subscriber } = useSubscriberContext();

    const [prevDataRowIndex, setPrevDataRowIndex] = useState(currentRowIndex);

    // keep track of the change of dataRow in order to be able to trigger variable validation
    // when the source of variable change comes from the undo/redo actions
    if (prevDataRowIndex !== currentRowIndex) {
        setPrevDataRowIndex(currentRowIndex);
    }

    useEffect(() => {
        if (dataSource?.id) {
            loadDataRowsByToken({ continuationToken: null }, { preselectFirstRow: true });
        }
    }, [dataSource?.id, loadDataRowsByToken]);

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
                loadDataRowsByToken({ continuationToken: null });
            }
        };
        subscriber?.on('onConnectorEvent', handler);
        return () => subscriber?.off('onConnectorEvent', handler);
    }, [subscriber, dataSource, resetData, loadDataRowsByToken]);

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

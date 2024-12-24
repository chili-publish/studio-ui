import { DataItem } from '@chili-publish/studio-sdk';
import { ConnectorInstance } from '@chili-publish/studio-sdk/lib/src/next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSubscriberContext } from '../../contexts/Subscriber';
import { SDKError } from '../../types/SDKError';

export const SELECTED_ROW_INDEX_KEY = 'DataSourceSelectedRowIdex';

const useDataSource = (isDocumentLoaded: boolean) => {
    const [dataConnector, setDataConnector] = useState<ConnectorInstance | null>(null);
    const [dataRows, setDataRows] = useState<DataItem[]>([]);
    const [continuationToken, setContinuationToken] = useState<string | null>(null);

    const [currentRowIndex, setCurrentRowIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const { subscriber } = useSubscriberContext();

    const loadDataRows = useCallback(async () => {
        if (!dataConnector) return;
        setIsLoading(true);

        try {
            const pageInfoResponse = await window.StudioUISDK.dataConnector.getPage(dataConnector.id, {
                limit: 15,
                continuationToken,
            });

            const rowItems = pageInfoResponse.parsedData?.data || [];
            setDataRows((prevData) => [...prevData, ...rowItems]);
            setContinuationToken(pageInfoResponse.parsedData?.continuationToken || null);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [dataConnector, continuationToken]);

    const currentRow: DataItem | undefined = useMemo(() => {
        return dataRows[currentRowIndex];
    }, [dataRows, currentRowIndex]);

    const currentInputRow = useMemo(() => {
        return currentRow ? Object.values(currentRow).join(' | ') : '';
    }, [currentRow]);

    const isPrevDisabled = useMemo(() => isLoading || currentRowIndex === 0, [currentRowIndex, isLoading]);
    const isNextDisabled = useMemo(
        () => isLoading || (currentRowIndex === dataRows.length - 1 && !continuationToken),
        [currentRowIndex, dataRows, isLoading, continuationToken],
    );

    const getPreviousRow = useCallback(() => {
        setCurrentRowIndex((prev) => prev - 1);
    }, []);

    const getNextRow = useCallback(async () => {
        if (continuationToken && currentRowIndex + 1 === dataRows.length) {
            await loadDataRows();
        }
        setCurrentRowIndex((prev) => prev + 1);
    }, [currentRowIndex, dataRows, continuationToken, loadDataRows]);

    const updateSelectedRow = useCallback((index: number) => {
        if (index >= 0) setCurrentRowIndex(index);
    }, []);

    useEffect(() => {
        if (!isDocumentLoaded) return;
        const getDataConnector = async () => {
            const { parsedData: defaultDataConnector } = await window.StudioUISDK.dataSource.getDataSource();
            setDataConnector(defaultDataConnector);
        };
        getDataConnector();
    }, [isDocumentLoaded]);

    useEffect(() => {
        if (dataConnector) loadDataRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataConnector]);

    useEffect(() => {
        (async () => {
            if (currentRow) {
                try {
                    await window.StudioUISDK.dataSource.setDataRow(currentRow);
                    await window.StudioUISDK.undoManager.addCustomData(SELECTED_ROW_INDEX_KEY, `${currentRowIndex}`);
                } catch (error) {
                    // "setDataRow" throws an error if there is not all variables available for setting the data source row
                    // We can use it later to show some warning popup with missed variables list
                    if ((error as SDKError).cause.name !== '401014') {
                        throw error;
                    }
                }
            }
        })();
    }, [currentRow, currentRowIndex]);

    useEffect(() => {
        const handler = (undoData: Record<string, string>) => {
            if (undoData[SELECTED_ROW_INDEX_KEY]) {
                updateSelectedRow(Number(undoData[SELECTED_ROW_INDEX_KEY]));
            }
        };
        subscriber?.on('onCustomUndoDataChanged', handler);
        return () => subscriber?.off('onCustomUndoDataChanged', handler);
    }, [subscriber, updateSelectedRow]);

    return {
        currentInputRow,
        currentRowIndex,
        updateSelectedRow,
        loadDataRows,
        getPreviousRow,
        getNextRow,
        dataRows,
        isLoading,
        isPrevDisabled,
        isNextDisabled,
        hasMoreRows: !!continuationToken,
        hasDataConnector: !!dataConnector,
    };
};

export default useDataSource;

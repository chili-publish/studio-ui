import { ConnectorInstance, ConnectorType } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Item = {[key: string]: string | number | boolean | Date | null};
const useDataSource = (isDocumentLoaded: boolean) => {
    const [dataConnector, setDataConnector] = useState<ConnectorInstance | null>();
    const [dataRows, setDataRows] = useState<Item[]>([]);
    const [continuationToken, setContinuationToken] = useState<string | null>(null);

    const [currentRowIndex, setCurrentRowIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

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

    const currentRow = useMemo(() => {
        const rowInfo = dataRows[currentRowIndex];
        return rowInfo ? Object.values(rowInfo).join('|') : '';
    }, [dataRows, currentRowIndex]);

    const isPrevDisabled = useMemo(() => isLoading || currentRowIndex === 0, [currentRowIndex, isLoading]);
    const isNextDisabled = useMemo(
        () => isLoading || (currentRowIndex === dataRows.length - 1 && !continuationToken),
        [currentRowIndex, dataRows, isLoading, continuationToken],
    );

    const getPreviousRow = useCallback(() => {
        setCurrentRowIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }, []);

    const getNextRow = useCallback(async () => {
        if (continuationToken && currentRowIndex + 1 === dataRows.length) {
            await loadDataRows();
        }
        setCurrentRowIndex((prev) => (currentRowIndex < dataRows.length ? prev + 1 : prev));
    }, [currentRowIndex, dataRows, continuationToken, loadDataRows]);

    const updateSelectedRow = useCallback((index: number) => {
        if (index >= 0) setCurrentRowIndex(index);
    }, []);

    useEffect(() => {
        if (!isDocumentLoaded) return;
        const getDataConnector = async () => {
            const dataConnectorsResponse = await window.StudioUISDK.connector.getAllByType(ConnectorType.data);
            const defaultDataConnector = dataConnectorsResponse.parsedData?.[0] || null;
            setDataConnector(defaultDataConnector);
        };
        getDataConnector();
    }, [isDocumentLoaded]);

    useEffect(() => {
        if (dataConnector) loadDataRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataConnector]);

    return {
        currentRow,
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
    };
};

export default useDataSource;

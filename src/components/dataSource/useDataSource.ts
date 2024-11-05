import { ConnectorInstance, ConnectorType } from '@chili-publish/studio-sdk';
import { DataItem } from '@chili-publish/studio-sdk/lib/src/types/DataConnectorTypes';
import { useCallback, useEffect, useMemo, useState } from 'react';

const useDataSource = () => {
    const [dataConnector, setDataConnector] = useState<ConnectorInstance | null>();
    const [dataRows, setDataRows] = useState<DataItem[]>([]);
    const [continuationToken, setContinuationToken] = useState<string | null>(null);

    const [currentRowIndex, setCurrentRowIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const getDataRows = useCallback(async () => {
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

    const loadDataRow = useCallback(async () => {
        if (!currentRow) getDataRows();
    }, [currentRow, getDataRows]);

    const getPreviousRow = useCallback(() => {
        setCurrentRowIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }, []);

    const getNextRow = useCallback(async () => {
        if (continuationToken && currentRowIndex + 1 === dataRows.length) {
            await getDataRows();
        }
        setCurrentRowIndex((prev) => (currentRowIndex < dataRows.length ? prev + 1 : prev));
    }, [currentRowIndex, dataRows, continuationToken, getDataRows]);

    useEffect(() => {
        const getDataConnector = async () => {
            const dataConnectorsResponse = await window.StudioUISDK.connector.getAllByType(ConnectorType.data);
            const defaultDataConnector = dataConnectorsResponse.parsedData?.[0] || null;
            setDataConnector(defaultDataConnector);
        };
        getDataConnector();
    }, []);

    useEffect(() => {
        if (dataConnector) getDataRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataConnector]);

    return {
        currentRow,
        currentRowIndex,
        loadDataRow,
        getPreviousRow,
        getNextRow,
        isLoading,
        isPrevDisabled,
        isNextDisabled,
    };
};

export default useDataSource;

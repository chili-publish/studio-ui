import { ConnectorEvent, ConnectorEventType, ConnectorHttpError, DataItem } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAsyncMemo } from 'use-async-memo';
import { useAppContext } from '../../contexts/AppProvider';
import { useAuthToken } from '../../contexts/AuthTokenProvider';
import { useSubscriberContext } from '../../contexts/Subscriber';
import { useUiConfigContext } from '../../contexts/UiConfigContext';
import { getRemoteMediaConnector } from '../../utils/connectors';

export const SELECTED_ROW_INDEX_KEY = 'DataSourceSelectedRowIdex';

function getDataSourceErrorText(status?: number) {
    switch (status) {
        case 401:
            return 'You don’t have access.';
        case 404:
            return 'Data not found.';
        default:
            return 'Unable to load data.';
    }
}

const useDataSource = () => {
    const { dataSource, isDocumentLoaded } = useAppContext();
    const [dataRows, setDataRows] = useState<DataItem[]>([]);
    const [continuationToken, setContinuationToken] = useState<string | null>(null);

    const [currentRowIndex, setCurrentRowIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const shouldUpdateDataRow = useRef(true);
    const [error, setError] = useState<{ status?: number; message: string } | undefined>();

    const { subscriber } = useSubscriberContext();
    const { graFxStudioEnvironmentApiBaseUrl } = useUiConfigContext();
    const { authToken } = useAuthToken();

    const hasUserAuthorization = useAsyncMemo(async () => {
        if (!dataSource) {
            return false;
        }
        const connector = await getRemoteMediaConnector(graFxStudioEnvironmentApiBaseUrl, dataSource.id, authToken);
        return connector.supportedAuthentication.browser.includes('oAuth2AuthorizationCode');
    }, [dataSource, authToken, graFxStudioEnvironmentApiBaseUrl]);

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

    const requiresUserAuthorizationCheck = useMemo(() => {
        return !currentInputRow && hasUserAuthorization && (!error || error.status === 401);
    }, [error, hasUserAuthorization, currentInputRow]);

    const resetData = useCallback(() => {
        setDataRows([]);
        setContinuationToken(null);
    }, []);

    const loadDataRowsByToken = useCallback(
        async (connectorId: string, token: string | null) => {
            setIsLoading(true);

            try {
                const { parsedData: page } = await window.StudioUISDK.dataConnector.getPage(connectorId, {
                    limit: 15,
                    continuationToken: token,
                });

                const rowItems = page?.data ?? [];
                setError(undefined);
                setDataRows((prevData) => [...prevData, ...rowItems]);
                setContinuationToken(page?.continuationToken ?? null);
            } catch (err) {
                resetData();
                // eslint-disable-next-line no-console
                console.error(err);
                if (err instanceof ConnectorHttpError) {
                    setError({
                        status: err.statusCode,
                        message: getDataSourceErrorText(err.statusCode),
                    });
                } else {
                    setError({
                        message: getDataSourceErrorText(),
                    });
                }
            } finally {
                setIsLoading(false);
            }
        },
        [resetData],
    );

    const loadDataRows = useCallback(async () => {
        if (!dataSource) return;
        loadDataRowsByToken(dataSource.id, continuationToken);
    }, [dataSource, continuationToken, loadDataRowsByToken]);

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
        if (dataSource) {
            loadDataRowsByToken(dataSource.id, null);
        }
    }, [dataSource, loadDataRowsByToken]);

    useEffect(() => {
        (async () => {
            if (currentRow && shouldUpdateDataRow.current) {
                await window.StudioUISDK.dataSource.setDataRow(currentRow);
            }
        })();
    }, [currentRow]);

    useEffect(() => {
        (async () => {
            if (!isDocumentLoaded) return;
            await window.StudioUISDK.undoManager.addCustomData(SELECTED_ROW_INDEX_KEY, `${currentRowIndex}`);
        })();
    }, [currentRowIndex, isDocumentLoaded]);

    useEffect(() => {
        const handler = (undoData: Record<string, string>) => {
            if (undoData[SELECTED_ROW_INDEX_KEY]) {
                const index = Number(undoData[SELECTED_ROW_INDEX_KEY]);
                // We prevent calling of `.setDataRow` for undo/redo calls (in this case index !== currentRowIndex)
                // to not create an extra undo item with same dataRow changes
                shouldUpdateDataRow.current = index === currentRowIndex;
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
                loadDataRowsByToken(dataSource.id, null);
            }
        };
        subscriber?.on('onConnectorEvent', handler);
        return () => subscriber?.off('onConnectorEvent', handler);
    }, [subscriber, dataSource, resetData, loadDataRowsByToken]);

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
        hasDataConnector: !!dataSource,
        requiresUserAuthorizationCheck,
        error: error?.message,
    };
};

export default useDataSource;

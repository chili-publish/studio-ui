import { formatCell } from '@chili-publish/grafx-shared-components';
import {
    BidirectionalDataPage,
    BidirectionalDataPageItem,
    ConnectorHttpError,
    DataItem,
    EditorResponse,
} from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAsyncMemo } from 'use-async-memo';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import { DataRemoteConnector } from '../../../utils/ApiTypes';
import { getRemoteConnector, isAuthenticationRequired } from '../../../utils/connectors';
import { useEnvironmentClientApi } from '../../../hooks/useEnvironmentClientApi';
import { useDirection } from '../../../hooks/useDirection';
import { useVariableHistory } from 'src/components/dataSource/useVariableHistory';
import { validateVariableList } from 'src/store/reducers/variableReducer';
import { useAppDispatch } from 'src/store';
import { PAGE_SIZE } from './dataSource.util';

export const SELECTED_ROW_INDEX_KEY = 'DataSourceSelectedRowIdex';

function getDataSourceErrorText(status?: number) {
    switch (status) {
        case 401:
            return 'You don’t have access.';
        case 404:
            return 'Data not found.';
        default:
            return 'Invalid data source.';
    }
}
type UseDataSourceType = {
    connectorId?: string;
    deduplicateRows?: (newRows: DataItem[], existingRows: DataItem[]) => DataItem[];

    getPageItemById?: (itemId: string) => Promise<EditorResponse<BidirectionalDataPageItem>>;
    getPage: (pageConfig: {
        continuationToken?: string | null;
        previousPageToken?: string | null;
    }) => Promise<EditorResponse<BidirectionalDataPage>>;
};
const useSharedDataSource = ({ connectorId, deduplicateRows, getPageItemById, getPage }: UseDataSourceType) => {
    const dispatch = useAppDispatch();
    const { graFxStudioEnvironmentApiBaseUrl } = useUiConfigContext();
    const { direction } = useDirection();
    const { connectors } = useEnvironmentClientApi();

    const [currentRowIndex, setCurrentRowIndex] = useState(0);
    const [currentDataRow, setCurrentDataRow] = useState<DataItem | undefined>(undefined);
    const [dataRows, setDataRows] = useState<DataItem[]>([]);

    const [previousPageToken, setPreviousPageToken] = useState<string | null>(null);
    const [continuationToken, setContinuationToken] = useState<string | null>(null);

    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [isPreviousPageLoading, setIsPreviousPageLoading] = useState(false);

    const [error, setError] = useState<{ status?: number; message: string } | undefined>();

    const shouldUpdateDataRow = useRef(true);
    const processingDataRow = useRef<number>(null);

    const { hasChanged: variablesChanged } = useVariableHistory();

    const currentInputRow = useMemo(() => {
        if (!currentDataRow) return '';

        const formattedValues = Object.values(currentDataRow).map((v) => formatCell(v));

        // For RTL, add directional formatting to each value
        if (direction === 'rtl') {
            return formattedValues.map((value) => `\u200F${value}`).join(' | ');
        }

        return formattedValues.join(' | ');
    }, [currentDataRow, direction]);

    const isPrevDisabled = useMemo(() => {
        const isFirstRow = currentRowIndex === 0;
        return isNextPageLoading || isPreviousPageLoading || (isFirstRow && !previousPageToken);
    }, [currentRowIndex, isNextPageLoading, isPreviousPageLoading, previousPageToken]);

    const isNextDisabled = useMemo(() => {
        const isLastRow = currentRowIndex === dataRows.length - 1;
        return isNextPageLoading || isPreviousPageLoading || (isLastRow && !continuationToken);
    }, [currentRowIndex, dataRows, isNextPageLoading, isPreviousPageLoading, continuationToken]);

    const resetData = useCallback(() => {
        setDataRows([]);
        setContinuationToken(null);
        setPreviousPageToken(null);
    }, []);

    const onProcessingDataRowChange = useCallback((rowIndex: number) => {
        processingDataRow.current = rowIndex;
    }, []);

    const loadDataRowsByToken = useCallback(
        async (
            tokenConfig: { previousPageToken?: string | null } | { continuationToken?: string | null },
            options?: {
                selectLastIncomingRowFromPreviousPage?: boolean;
                selectFirstIncomingRowFromNextPage?: boolean;
                preselectFirstRow?: boolean;
            },
        ) => {
            const nextPageRequested = 'continuationToken' in tokenConfig;
            const previousPageRequested = !nextPageRequested && 'previousPageToken' in tokenConfig;

            if (nextPageRequested) setIsNextPageLoading(true);
            if (previousPageRequested) setIsPreviousPageLoading(true);

            const pageConfig = {
                limit: PAGE_SIZE,
                continuationToken: nextPageRequested ? tokenConfig.continuationToken : undefined,
                previousPageToken: previousPageRequested ? tokenConfig.previousPageToken : undefined,
            };
            try {
                const response = await getPage(pageConfig);
                const page = response?.parsedData;

                const rowItems = page?.data ?? [];
                setError(undefined);

                if (nextPageRequested) setContinuationToken(page?.continuationToken ?? null);
                if (previousPageRequested) setPreviousPageToken(page?.previousPageToken ?? null);

                if (options?.preselectFirstRow) {
                    setCurrentRowIndex(0);
                    setCurrentDataRow(rowItems[0] ?? undefined);
                }
                setDataRows((prevData) => {
                    let rowsToMerge = rowItems;
                    if (deduplicateRows) {
                        rowsToMerge = deduplicateRows(rowItems, prevData);
                    }

                    if (nextPageRequested) {
                        if (options?.selectFirstIncomingRowFromNextPage && rowsToMerge.length > 0) {
                            shouldUpdateDataRow.current = true;

                            setCurrentRowIndex(prevData.length);
                            setCurrentDataRow(rowsToMerge[0]);
                            return [...prevData, ...rowsToMerge];
                        }
                        return [...prevData, ...rowsToMerge];
                    } else if (options?.selectLastIncomingRowFromPreviousPage && rowsToMerge.length > 0) {
                        const pickIdx = rowsToMerge.length - 1;

                        shouldUpdateDataRow.current = true;
                        setCurrentRowIndex(pickIdx);
                        setCurrentDataRow(rowsToMerge[rowsToMerge.length - 1]);
                        return [...rowsToMerge, ...prevData];
                    } else {
                        setCurrentRowIndex((prev) => (prev ?? 0) + rowsToMerge.length);
                        return [...rowsToMerge, ...prevData];
                    }
                });
                return {
                    data: rowItems,
                    hasNextPage: !!page?.continuationToken,
                    hasPreviousPage: !!page?.previousPageToken,
                };
            } catch (err) {
                resetData();
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
                return { data: [], hasNextPage: false, hasPreviousPage: false };
            } finally {
                setIsNextPageLoading(false);
                setIsPreviousPageLoading(false);
            }
        },
        [resetData, deduplicateRows, getPage],
    );

    const loadBySelectedItem = useCallback(
        async (variableEntryId: string) => {
            if (!getPageItemById) return;

            let selectedItem: DataItem | null = null;
            let nextPageTokenFromItem: string | null = null;
            let previousPageTokenFromItem: string | null = null;

            try {
                const { parsedData: item } = await getPageItemById(variableEntryId);

                selectedItem = item?.data ?? null;
                nextPageTokenFromItem = item?.continuationToken ?? null;
                previousPageTokenFromItem = item?.previousPageToken ?? null;
            } catch (err) {
                setCurrentDataRow(undefined);
                // Ignore failed getPageItemById call
                // eslint-disable-next-line no-console
                console.error(err);
            }

            // loadDataRowsByToken identifies load direction by a single token; prefer continuation over previous.
            if (nextPageTokenFromItem) {
                await loadDataRowsByToken({ continuationToken: nextPageTokenFromItem });
                // In case the item contains a previous page token, update the state to reflect the previous page navigation
                if (previousPageTokenFromItem) {
                    setPreviousPageToken(previousPageTokenFromItem);
                }
            } else if (previousPageTokenFromItem) {
                await loadDataRowsByToken({ previousPageToken: previousPageTokenFromItem });
            } else {
                await loadDataRowsByToken({ continuationToken: null });
            }

            if (selectedItem) {
                setCurrentRowIndex(0);
                setCurrentDataRow(selectedItem);
                shouldUpdateDataRow.current = true;
                setDataRows((prevData) => {
                    const rowsToMerge = deduplicateRows ? deduplicateRows([selectedItem], prevData) : [selectedItem];
                    // Next-chunk load: rows follow the selected item → selected row first. Previous-chunk (or first
                    // page): older rows precede the selected item → selected row last.
                    if (nextPageTokenFromItem) {
                        return [...rowsToMerge, ...prevData];
                    } else {
                        return [...prevData, ...rowsToMerge];
                    }
                });
            }
        },
        [deduplicateRows, loadDataRowsByToken, getPageItemById],
    );

    const loadNextPage = useCallback(
        async (options?: {
            selectFirstIncomingRowFromNextPage?: boolean;
        }): Promise<{ data: DataItem[]; hasNextPage: boolean; hasPreviousPage: boolean }> => {
            if (!connectorId) return { data: [], hasNextPage: false, hasPreviousPage: false };
            return loadDataRowsByToken({ continuationToken }, options);
        },
        [connectorId, continuationToken, loadDataRowsByToken],
    );

    const loadPreviousPage = useCallback(
        async (options?: { selectLastIncomingRowFromPreviousPage?: boolean }) => {
            if (!connectorId) return { data: [], hasNextPage: false, hasPreviousPage: false };
            return loadDataRowsByToken({ previousPageToken }, options);
        },
        [connectorId, previousPageToken, loadDataRowsByToken],
    );

    const getPreviousRow = useCallback(async () => {
        if (processingDataRow.current !== null) return;
        if (previousPageToken && currentRowIndex === 0) {
            await loadPreviousPage({ selectLastIncomingRowFromPreviousPage: true });
            return;
        }
        let prevIndex = currentRowIndex - 1;
        prevIndex = prevIndex > 0 ? prevIndex : 0;

        shouldUpdateDataRow.current = true;
        setCurrentRowIndex(prevIndex);
        setCurrentDataRow(dataRows[prevIndex]);
    }, [currentRowIndex, dataRows, previousPageToken, loadPreviousPage]);

    const getNextRow = useCallback(async () => {
        if (processingDataRow.current !== null) return;
        if (continuationToken && currentRowIndex === dataRows.length - 1) {
            await loadNextPage({ selectFirstIncomingRowFromNextPage: true });
            return;
        }
        let nextIndex = currentRowIndex + 1;
        nextIndex = nextIndex < dataRows.length - 1 ? nextIndex : dataRows.length - 1;

        shouldUpdateDataRow.current = true;
        setCurrentRowIndex(nextIndex);
        setCurrentDataRow(dataRows[nextIndex]);
    }, [currentRowIndex, dataRows, continuationToken, loadNextPage]);

    const updateSelectedRow = useCallback(
        (index: number | undefined, row?: DataItem) => {
            if (processingDataRow.current !== null) return;

            shouldUpdateDataRow.current = true;
            setCurrentRowIndex(index ?? 0);
            setCurrentDataRow(row ?? (index !== undefined ? dataRows[index] : undefined));
        },
        [dataRows],
    );

    const hasUserAuthorization = useAsyncMemo(async () => {
        if (!connectorId) {
            return false;
        }
        try {
            const connector = await getRemoteConnector<DataRemoteConnector>(
                connectorId,
                (envConnectorId) => connectors.getByIdAs<DataRemoteConnector>(envConnectorId), // Pass the environment client API method
            );
            return isAuthenticationRequired(connector);
        } catch {
            return false;
        }
    }, [connectorId, getRemoteConnector, graFxStudioEnvironmentApiBaseUrl, connectors]);

    const requiresUserAuthorizationCheck = useMemo(() => {
        return !currentInputRow && hasUserAuthorization && (!error || error.status === 401);
    }, [error, hasUserAuthorization, currentInputRow]);

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
        currentInputRow,
        currentRowIndex,
        currentDataRow,
        onSelectedRowChanged: setCurrentRowIndex,

        getPreviousRow,
        getNextRow,
        updateSelectedRow,

        dataRows,

        loadBySelectedItem,
        loadDataRowsByToken,
        loadNextPage,
        loadPreviousPage,
        resetData,

        isNextPageLoading,
        isPreviousPageLoading,

        isPrevDisabled,
        isNextDisabled,

        hasNextPage: !!continuationToken,
        hasPreviousPage: !!previousPageToken,

        requiresUserAuthorizationCheck,
        error: error?.message,

        processingDataRow,
        onProcessingDataRowChange,
        shouldUpdateDataRow,
    };
};

export default useSharedDataSource;

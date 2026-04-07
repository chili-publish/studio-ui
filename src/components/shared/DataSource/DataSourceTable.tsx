import {
    InfiniteScrollingTable,
    InfiniteScrollingTableWithStateMessages,
} from '@chili-publish/grafx-shared-components';
import { DataItem } from '@chili-publish/studio-sdk';

interface DataSourceTableProps {
    data: DataItem[];
    error?: string;
    hasNextPage?: boolean;
    nextPageLoading?: boolean;
    onNextPageRequested: () => void;

    hasPreviousPage?: boolean;
    previousPageLoading?: boolean;
    onPreviousPageRequested?: () => void;

    selectedRow?: DataItem;
    selectedRowKey?: keyof DataItem;

    selectedRowIndex?: number;

    onSelectedRowChanged: (_: number) => void;
}

const DataSourceTable = ({
    data,
    error,
    hasNextPage,
    nextPageLoading,
    selectedRow,
    selectedRowKey,
    selectedRowIndex,
    onNextPageRequested,
    onSelectedRowChanged,
    hasPreviousPage,
    previousPageLoading,
    onPreviousPageRequested,
}: DataSourceTableProps) => {
    return (
        <InfiniteScrollingTableWithStateMessages
            errorMessage={error || ''}
            emptyListMessage={'No data available.'}
            hasData={data.length > 0}
            isLoading={(nextPageLoading || previousPageLoading) ?? false}
        >
            <InfiniteScrollingTable
                rows={data}
                onSelectedRowChanged={onSelectedRowChanged}
                hasPreviousPage={hasPreviousPage ?? false}
                previousPageLoading={previousPageLoading ?? false}
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                onPreviousPageRequested={onPreviousPageRequested ?? (() => {})}
                hasNextPage={hasNextPage ?? false}
                nextPageLoading={nextPageLoading || false}
                onNextPageRequested={onNextPageRequested}
                labels={{
                    prevPageBtn: 'Load previous page',
                }}
                hideIndex
                {...(selectedRowIndex !== undefined ? { selectedRowIndex } : {})}
                {...(selectedRow !== undefined ? { selectedRow, selectedRowKey } : {})}
            />
        </InfiniteScrollingTableWithStateMessages>
    );
};

export default DataSourceTable;

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
    const previousPageProps = onPreviousPageRequested
        ? ({
              hasPreviousPage: hasPreviousPage ?? false,
              previousPageLoading: previousPageLoading ?? false,
              onPreviousPageRequested,
          } as const)
        : ({
              hasPreviousPage: undefined as never,
              previousPageLoading: undefined as never,
              onPreviousPageRequested: undefined as never,
          } as const);

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
                hasNextPage={hasNextPage ?? false}
                nextPageLoading={nextPageLoading || false}
                onNextPageRequested={onNextPageRequested}
                labels={{
                    prevPageBtn: 'Load previous page',
                }}
                hideIndex
                {...(selectedRowIndex !== undefined ? { selectedRowIndex } : {})}
                {...(selectedRow !== undefined ? { selectedRow, selectedRowKey } : {})}
                {...previousPageProps}
            />
        </InfiniteScrollingTableWithStateMessages>
    );
};

export default DataSourceTable;

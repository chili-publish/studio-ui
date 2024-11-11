import { LoadingIcon, Table, useInfiniteScrolling } from '@chili-publish/grafx-shared-components';
import { LoadingContainer } from './DataSourceModal.styles';
import { DataItem } from './DataSource.types';

interface DataSourceTableProps {
    data: DataItem[];
    hasMoreData?: boolean;
    dataIsLoading?: boolean;
    onNextPageRequested: () => void;

    selectedRow: number;
    onSelectedRowChanged: (_: number) => void;
}

function DataSourceTable({
    data,
    hasMoreData,
    dataIsLoading,
    selectedRow,
    onNextPageRequested,
    onSelectedRowChanged,
}: DataSourceTableProps) {
    const { infiniteScrollingRef } = useInfiniteScrolling(
        (hasMoreData && !dataIsLoading) || false,
        onNextPageRequested,
    );

    return (
        <>
            <Table defaultSelectedRow={selectedRow} rows={data} onSelectedRowChanged={onSelectedRowChanged} />
            {dataIsLoading && data.length !== 0 && (
                <LoadingContainer>
                    <LoadingIcon />
                </LoadingContainer>
            )}
            <div ref={infiniteScrollingRef} />
        </>
    );
}

export default DataSourceTable;

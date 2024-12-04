import { LoadingIcon, Table, useInfiniteScrolling } from '@chili-publish/grafx-shared-components';
import { DataItem } from '@chili-publish/studio-sdk';
import { LoadingContainer } from './DataSourceModal.styles';

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
            <Table
                defaultSelectedRow={selectedRow}
                // Type casting is necessary since currently table supports only string and number
                rows={data as Record<string, string | number>[]}
                onSelectedRowChanged={onSelectedRowChanged}
            />
            {dataIsLoading && (
                <LoadingContainer>
                    <LoadingIcon />
                </LoadingContainer>
            )}
            <div ref={infiniteScrollingRef} />
        </>
    );
}

export default DataSourceTable;

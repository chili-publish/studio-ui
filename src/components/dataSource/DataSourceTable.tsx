import { AvailableIcons, Icon, LoadingIcon, Table, useInfiniteScrolling } from '@chili-publish/grafx-shared-components';
import { DataItem } from '@chili-publish/studio-sdk';
import {
    Center,
    EmptyStateText,
    ErrorTextBox,
    ErrorTextMsg,
    InfiniteScrollingContainer,
    TableWrapper,
} from './DataSourceTable.styles';

interface DataSourceTableProps {
    data: DataItem[];
    error?: string;
    hasMoreData?: boolean;
    dataIsLoading?: boolean;
    onNextPageRequested: () => void;

    selectedRow: number;
    onSelectedRowChanged: (_: number) => void;
}

function DataSourceTable({
    data,
    error,
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
            {!error && data.length > 0 && (
                <TableWrapper>
                    <Table defaultSelectedRow={selectedRow} rows={data} onSelectedRowChanged={onSelectedRowChanged} />
                </TableWrapper>
            )}

            {dataIsLoading && (
                <Center>
                    <LoadingIcon />
                </Center>
            )}
            {!dataIsLoading && data.length === 0 && !error && (
                <Center>
                    <EmptyStateText>No data available.</EmptyStateText>
                </Center>
            )}
            {!dataIsLoading && error && (
                <Center>
                    <ErrorTextBox>
                        <Icon icon={AvailableIcons.faCircleExclamation} />
                        <ErrorTextMsg>{error}</ErrorTextMsg>
                    </ErrorTextBox>
                </Center>
            )}
            <InfiniteScrollingContainer ref={infiniteScrollingRef} />
        </>
    );
}

export default DataSourceTable;

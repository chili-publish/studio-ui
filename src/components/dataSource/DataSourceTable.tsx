import { AvailableIcons, Icon, InfiniteScrollingTable } from '@chili-publish/grafx-shared-components';
import { DataItem } from '@chili-publish/studio-sdk';
import { EmptyStateText, ErrorTextBox, ErrorTextMsg, FullSizeCenter } from './DataSourceTable.styles';

interface DataSourceTableProps {
    data: DataItem[];
    error?: string;
    hasMoreData?: boolean;
    dataIsLoading?: boolean;
    onNextPageRequested: () => void;

    selectedRow: number;
    onSelectedRowChanged: (_: number) => void;
}

const DataSourceTable = ({
    data,
    error,
    hasMoreData,
    dataIsLoading,
    selectedRow,
    onNextPageRequested,
    onSelectedRowChanged,
}: DataSourceTableProps) => {
    return (
        <>
            {!error && data.length > 0 && (
                <InfiniteScrollingTable
                    rows={data}
                    defaultSelectedRow={selectedRow}
                    onSelectedRowChanged={onSelectedRowChanged}
                    onNextPageRequested={onNextPageRequested}
                    nextPageLoading={dataIsLoading || false}
                    hasNextPage={hasMoreData || false}
                />
            )}

            {!dataIsLoading && data.length === 0 && !error && (
                <FullSizeCenter>
                    <EmptyStateText>No data available.</EmptyStateText>
                </FullSizeCenter>
            )}
            {!dataIsLoading && error && (
                <FullSizeCenter>
                    <ErrorTextBox>
                        <Icon icon={AvailableIcons.faCircleExclamation} />
                        <ErrorTextMsg>{error}</ErrorTextMsg>
                    </ErrorTextBox>
                </FullSizeCenter>
            )}
        </>
    );
};

export default DataSourceTable;

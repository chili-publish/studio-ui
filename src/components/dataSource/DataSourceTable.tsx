import { AvailableIcons, Icon, LoadingIcon, Table, useInfiniteScrolling } from '@chili-publish/grafx-shared-components';
import { DataItem } from '@chili-publish/studio-sdk';
import { useMemo } from 'react';
import { Center, EmptyStateText, ErrorTextBox, ErrorTextMsg, TableWrapper } from './DataSourceTable.styles';

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

    // TODO: Remove/Adopt type casting in context of https://chilipublishintranet.atlassian.net/browse/WRS-2253
    const transformedData = useMemo(() => {
        return data.map((di) =>
            Object.entries(di).reduce((transformed, [key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                    // eslint-disable-next-line no-param-reassign
                    transformed[key] = value;
                }
                if (value instanceof Date) {
                    // eslint-disable-next-line no-param-reassign
                    transformed[key] = value.toISOString();
                }
                if (typeof value === 'boolean') {
                    // eslint-disable-next-line no-param-reassign
                    transformed[key] = `${value}`;
                }
                if (value === null) {
                    // eslint-disable-next-line no-param-reassign
                    transformed[key] = '';
                }
                return transformed;
            }, {} as Record<string, string | number>),
        );
    }, [data]);

    return (
        <>
            {!error && data.length > 0 && (
                <TableWrapper>
                    <Table
                        defaultSelectedRow={selectedRow}
                        rows={transformedData}
                        onSelectedRowChanged={onSelectedRowChanged}
                    />
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
            <div ref={infiniteScrollingRef} />
        </>
    );
}

export default DataSourceTable;

import DataSourceInput from 'src/components/shared/DataSource/DataSourceInput';
import useDataSourceVariable from './useDataSourceVariable';
import { DataSourceVariable } from '@chili-publish/studio-sdk';
import { useCallback, useState } from 'react';
import OutputDataSourceModal from '../../shared/DataSource/OutputDataSourceModal';

interface IDataSourceVariableTableMode {
    variable: DataSourceVariable;
}

const DataSourceVariableTableMode = (props: IDataSourceVariableTableMode) => {
    const [isDataSourceModalOpen, setIsDataSourceModalOpen] = useState(false);
    const { variable } = props;
    const {
        currentInputRow,
        currentDataRow,
        currentRowKey,
        updateSelectedRow,
        dataRows,
        isPrevDisabled,
        isNextDisabled,
        getPreviousRow,
        getNextRow,
        loadPreviousPage,
        loadNextPage,
        hasPreviousPage,
        hasNextPage,
        isPreviousPageLoading,
        isNextPageLoading,
        error,
        requiresUserAuthorizationCheck,
    } = useDataSourceVariable({ variable });

    const handleDataSourceModalOpen = useCallback(
        (event: React.MouseEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
            // input value needs to be truncated when datatable is open
            event.currentTarget.blur();
            if (requiresUserAuthorizationCheck) {
                loadNextPage();
            } else {
                setIsDataSourceModalOpen(true);
            }
        },
        [requiresUserAuthorizationCheck, loadNextPage, setIsDataSourceModalOpen],
    );
    return (
        <>
            <DataSourceInput
                isDataRowIndexHidden={true}
                currentRow={currentInputRow}
                dataIsLoading={isNextPageLoading}
                isEmptyState={!!error || dataRows.length === 0 || !currentDataRow}
                isPrevDisabled={isPrevDisabled}
                isNextDisabled={isNextDisabled}
                onInputClick={handleDataSourceModalOpen}
                onPrevClick={getPreviousRow}
                onNextClick={getNextRow}
                labels={{ input: 'Data row' }}
            />
            {isDataSourceModalOpen ? (
                <DataSourceModal
                    isOpen={isDataSourceModalOpen}
                    data={dataRows}
                    error={error}
                    selectedRow={currentDataRow}
                    selectedRowKey={currentRowKey}
                    onSelectedRowChanged={updateSelectedRow}
                    previousPageLoading={isPreviousPageLoading}
                    hasPreviousPage={hasPreviousPage}
                    onPreviousPageRequested={loadPreviousPage}
                    nextPageLoading={isNextPageLoading}
                    hasNextPage={hasNextPage}
                    onNextPageRequested={loadNextPage}
                    onClose={() => setIsDataSourceModalOpen(false)}
                />
            ) : null}
        </>
    );
};

export default DataSourceVariableTableMode;

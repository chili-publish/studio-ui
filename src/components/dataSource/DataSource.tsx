import useDataSource from './useDataSource';
import DataSourceModal from './DataSourceModal';
import DataSourceInput from './DataSourceInput';
import { useCallback, useState } from 'react';

interface DataSourceProps {
    isDocumentLoaded: boolean;
}
function DataSource({ isDocumentLoaded }: DataSourceProps) {
    const [isDataSourceModalOpen, setIsDataSourceModalOpen] = useState(false);

    const {
        currentRow,
        currentRowIndex,
        updateSelectedRow,
        isLoading,
        dataRows,
        hasMoreRows,
        isPrevDisabled,
        isNextDisabled,
        loadDataRows,
        getPreviousRow,
        getNextRow,
    } = useDataSource(isDocumentLoaded);

    const onDataSourceModalClose = useCallback(() => {
        setIsDataSourceModalOpen(false);
    }, []);

    const onSelectedRowConfirmed = useCallback((index: number) => {
        updateSelectedRow(index);
        setIsDataSourceModalOpen(false);
    }, []);

    const onInputClick = useCallback(() => {
        if (!currentRow) {
            loadDataRows();
        } else {
            setIsDataSourceModalOpen(true);
        }
    }, [currentRow]);

    return (
        <>
            <DataSourceInput
                currentRow={currentRow}
                currentRowIndex={currentRowIndex}
                dataIsLoading={isLoading}
                isPrevDisabled={isPrevDisabled}
                isNextDisabled={isNextDisabled}
                onInputClick={onInputClick}
                onPrevClick={getPreviousRow}
                onNextClick={getNextRow}
            />
            {isDataSourceModalOpen ? (
                <DataSourceModal
                    data={dataRows}
                    selectedRow={currentRowIndex}
                    onSelectedRowChanged={updateSelectedRow}
                    onSelectedRowConfirmed={onSelectedRowConfirmed}
                    dataIsLoading={isLoading}
                    hasMoreData={hasMoreRows}
                    onNextPageRequested={loadDataRows}
                    onClose={onDataSourceModalClose}
                />
            ) : null}
        </>
    );
}

export default DataSource;

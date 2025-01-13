import { useCallback } from 'react';
import { useAppContext } from '../../contexts/AppProvider';
import { PanelTitle } from '../shared/Panel.styles';
import DataSourceInput from './DataSourceInput';
import DataSourceModal from './DataSourceModal';
import useDataSource from './useDataSource';

function DataSource() {
    const { isDataSourceModalOpen, setIsDataSourceModalOpen } = useAppContext();

    const {
        currentInputRow,
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
        hasDataConnector,
    } = useDataSource();

    const onDataSourceModalClose = useCallback(() => {
        setIsDataSourceModalOpen(false);
    }, [setIsDataSourceModalOpen]);

    const onSelectedRowChanged = useCallback(
        (index: number) => {
            updateSelectedRow(index);
        },
        [updateSelectedRow],
    );

    const onInputClick = useCallback(
        (event: React.MouseEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
            // input value needs to be truncated when datatable is open
            event.currentTarget.blur();
            if (!currentInputRow) {
                loadDataRows();
            } else {
                setIsDataSourceModalOpen(true);
            }
        },
        [currentInputRow, loadDataRows, setIsDataSourceModalOpen],
    );

    if (!hasDataConnector) return null;

    return (
        <>
            <PanelTitle>Data source</PanelTitle>
            <DataSourceInput
                currentRow={currentInputRow}
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
                    isOpen={isDataSourceModalOpen}
                    data={dataRows}
                    selectedRow={currentRowIndex}
                    onSelectedRowChanged={onSelectedRowChanged}
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

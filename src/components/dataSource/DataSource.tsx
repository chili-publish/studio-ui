import { useTheme } from '@chili-publish/grafx-shared-components';
import { useCallback, useState } from 'react';
import { PanelTitle } from '../shared/Panel.styles';
import DataSourceInput from './DataSourceInput';
import DataSourceModal from './DataSourceModal';
import useDataSource from './useDataSource';

interface DataSourceProps {
    isDocumentLoaded: boolean;
}
function DataSource({ isDocumentLoaded }: DataSourceProps) {
    const { panel } = useTheme();
    const [isDataSourceModalOpen, setIsDataSourceModalOpen] = useState(false);

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
    } = useDataSource(isDocumentLoaded);

    const onDataSourceModalClose = useCallback(() => {
        setIsDataSourceModalOpen(false);
    }, []);

    const onSelectedRowChanged = useCallback(
        (index: number) => {
            updateSelectedRow(index);
            setIsDataSourceModalOpen(false);
        },
        [updateSelectedRow],
    );

    const onInputClick = useCallback(() => {
        if (!currentInputRow) {
            loadDataRows();
        } else {
            setIsDataSourceModalOpen(true);
        }
    }, [currentInputRow, loadDataRows]);

    if (!hasDataConnector) return null;
    return (
        <>
            <PanelTitle panelTheme={panel}>Data source</PanelTitle>
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

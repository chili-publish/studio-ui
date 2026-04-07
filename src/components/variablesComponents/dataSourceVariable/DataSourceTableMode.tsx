import DataSourceInput from 'src/components/shared/DataSource/DataSourceInput';
import useDataSourceVariable from './useDataSourceVariable';
import { ConnectorDataSourceVariableSource, DataSourceVariable } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';
import DataSourceModal from '../../shared/DataSource/DataSourceModal';
import { InputLabel, useMobileSize } from '@chili-publish/grafx-shared-components';
import { useSelector } from 'react-redux';
import { PanelType, selectActivePanel, showDataSourceVariableTableModePanel } from 'src/store/reducers/panelReducer';
import { DataSourceTableWrapper } from 'src/components/variables/mobileVariables/MobileTray.styles';
import DataSourceTable from 'src/components/shared/DataSource/DataSourceTable';
import { useAppDispatch } from 'src/store';
import { getVariablePlaceholder } from '../variablePlaceholder.util';
import { HelpTextWrapper } from '../VariablesComponents.styles';

interface IDataSourceVariableTableMode {
    variable: DataSourceVariable;
    validationError: string | undefined;
    onValueChange?: (value: string, { changed }: { changed: boolean }) => void;
}

const DataSourceVariableTableMode = (props: IDataSourceVariableTableMode) => {
    const dispatch = useAppDispatch();
    const isMobileSize = useMobileSize();
    const activePanel = useSelector(selectActivePanel);
    const activePanelOnMobile = activePanel === PanelType.DATA_SOURCE_VARIABLE_TABLE_MODE;

    // focus and blur events should also be implemented
    // onValueChange should be called to validate the variable
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variable, validationError, onValueChange } = props;
    const {
        isDataSourceModalOpen,
        setIsDataSourceModalOpen,
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

    const handleDataSourceOpen = useCallback(
        (event: React.MouseEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
            // input value needs to be truncated when datatable is open
            event.currentTarget.blur();
            if (requiresUserAuthorizationCheck) {
                loadNextPage();
            } else {
                if (isMobileSize) {
                    dispatch(showDataSourceVariableTableModePanel({ variableId: variable.id }));
                } else {
                    setIsDataSourceModalOpen(true);
                }
            }
        },
        [requiresUserAuthorizationCheck, loadNextPage, setIsDataSourceModalOpen, dispatch, isMobileSize, variable.id],
    );
    const placeholder = getVariablePlaceholder(variable);
    const selectedConnector = (variable.value as ConnectorDataSourceVariableSource)?.connectorId;
    const configuredConnector = !!selectedConnector && !error;

    if (!configuredConnector) {
        return null;
    }

    if (isMobileSize && activePanelOnMobile) {
        return (
            <DataSourceTableWrapper>
                <DataSourceTable
                    data={dataRows}
                    error={error}
                    selectedRow={currentDataRow}
                    selectedRowKey={currentRowKey ?? undefined}
                    onSelectedRowChanged={updateSelectedRow}
                    previousPageLoading={isPreviousPageLoading}
                    hasPreviousPage={hasPreviousPage}
                    onPreviousPageRequested={loadPreviousPage}
                    nextPageLoading={isNextPageLoading}
                    hasNextPage={hasNextPage}
                    onNextPageRequested={loadNextPage}
                />
            </DataSourceTableWrapper>
        );
    }

    return (
        <HelpTextWrapper>
            <DataSourceInput
                isDataRowIndexHidden={true}
                currentRow={currentInputRow}
                dataIsLoading={isNextPageLoading || isPreviousPageLoading || !currentDataRow}
                isEmptyState={!!error || dataRows.length === 0 || !currentDataRow}
                isPrevDisabled={isPrevDisabled}
                isNextDisabled={isNextDisabled}
                onInputClick={handleDataSourceOpen}
                onPrevClick={getPreviousRow}
                onNextClick={getNextRow}
                labels={{ input: variable.label ?? variable.name, placeholder }}
            />
            {isDataSourceModalOpen && !activePanelOnMobile ? (
                <DataSourceModal
                    title="Data Source"
                    isOpen={isDataSourceModalOpen}
                    data={dataRows}
                    error={error}
                    selectedRow={currentDataRow}
                    selectedRowKey={currentRowKey ?? undefined}
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
            {variable.helpText && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
};

export default DataSourceVariableTableMode;

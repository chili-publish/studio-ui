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
import { useUiConfigContext } from 'src/contexts/UiConfigContext';

interface IDataSourceVariableTableMode {
    variable: DataSourceVariable;
    validationError: string | undefined;
}

const DataSourceVariableTableMode = (props: IDataSourceVariableTableMode) => {
    const dispatch = useAppDispatch();
    const isMobileSize = useMobileSize();
    const activePanel = useSelector(selectActivePanel);
    const activePanelOnMobile = activePanel === PanelType.DATA_SOURCE_VARIABLE_TABLE_MODE;

    const { variable, validationError } = props;
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
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();

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
                onVariableFocus?.(variable.id);
            }
        },
        [
            requiresUserAuthorizationCheck,
            loadNextPage,
            setIsDataSourceModalOpen,
            dispatch,
            isMobileSize,
            variable.id,
            onVariableFocus,
        ],
    );

    const handleDataSourceModalClose = useCallback(() => {
        setIsDataSourceModalOpen(false);
        onVariableBlur?.(variable.id);
    }, [setIsDataSourceModalOpen, variable.id, onVariableBlur]);

    const placeholder = getVariablePlaceholder(variable);
    const selectedConnector = (variable.value as ConnectorDataSourceVariableSource)?.connectorId;
    const configuredConnector = !!selectedConnector;

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
                dataIsLoading={isNextPageLoading || isPreviousPageLoading}
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
                    onClose={handleDataSourceModalClose}
                />
            ) : null}
            {variable.helpText && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
};

export default DataSourceVariableTableMode;

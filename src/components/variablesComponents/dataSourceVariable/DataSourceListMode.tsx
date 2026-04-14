import {
    AvailableIcons,
    InputLabel,
    LoadPageParams,
    Select,
    useMobileSize,
} from '@chili-publish/grafx-shared-components';
import {
    ConnectorDataSourceVariableSource,
    DataSourceVariable,
    DataSourceVariableDisplayOptionsList,
} from '@chili-publish/studio-sdk';
import useDataSourceVariable from './useDataSourceVariable';
import MobileDataSourceListModeControl from './mobile/MobileDataSourceListModeControl';
import { useSelector } from 'react-redux';
import { PanelType, selectActivePanel } from 'src/store/reducers/panelReducer';
import MobileDataSourceListModeOptions from './mobile/MobileDataSourceListModeOptions';
import { useEffect, useMemo, useState } from 'react';
import { getVariablePlaceholder } from '../variablePlaceholder.util';
import { HelpTextWrapper } from '../VariablesComponents.styles';
import { useUiConfigContext } from 'src/contexts/UiConfigContext';

interface IDataSourceVariableListMode {
    variable: DataSourceVariable;
    validationError: string | undefined;
}
const DataSourceVariableListMode = (props: IDataSourceVariableListMode) => {
    const isMobileSize = useMobileSize();
    const activePanel = useSelector(selectActivePanel);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean | null>(null);
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();

    const { variable, validationError } = props;
    const {
        currentRowKey,
        updateSelectedRow,
        dataRows,
        loadPreviousPage,
        loadNextPage,
        error,
        hasPreviousPage,
        hasNextPage,
        isPreviousPageLoading,
        isNextPageLoading,
    } = useDataSourceVariable({
        variable,
    });

    const displayColumn = (variable.displayOptions as DataSourceVariableDisplayOptionsList)?.displayColumn;
    const options = useMemo(
        () =>
            dataRows
                .map((row) => {
                    if (!row[displayColumn]) return null;
                    return {
                        value: row[currentRowKey]?.toString() ?? '',
                        label: `${row[displayColumn]?.toString()}`,
                    };
                })
                .filter((option) => option !== null),
        [dataRows, currentRowKey, displayColumn],
    );

    const selectedValue = options.find((option) => option.value?.toString() === variable.entryId?.toString()) ?? null;

    const handlePageRequested = async (params: LoadPageParams) => {
        const promise = params.direction === 'up' ? loadPreviousPage() : loadNextPage();
        return promise.then((result) => {
            return {
                hasNextPage: result?.hasNextPage,
                hasPreviousPage: result?.hasPreviousPage,
                options:
                    result?.data.map((row) => ({
                        value: row[currentRowKey]?.toString() ?? '',
                        label: row[displayColumn]?.toString() || '',
                    })) || [],
            };
        });
    };

    const handleRowSelected = (value: string) => {
        const rowIndex = dataRows.findIndex((row) => row[currentRowKey]?.toString() === value?.toString());
        updateSelectedRow(rowIndex, dataRows[rowIndex]);
    };

    const placeholder = getVariablePlaceholder(variable);
    const selectedConnector = (variable.value as ConnectorDataSourceVariableSource)?.connectorId;
    const configuredConnector = !!selectedConnector;

    useEffect(() => {
        if (isDropdownOpen === null) {
            return;
        }
        if (isDropdownOpen) {
            onVariableFocus?.(variable.id);
        } else {
            onVariableBlur?.(variable.id);
        }
    }, [isDropdownOpen, onVariableFocus, onVariableBlur, variable.id]);

    useEffect(() => {
        if (!isMobileSize) {
            return;
        }
        const dropdownOpenOnMobile = activePanel === PanelType.DATA_SOURCE_VARIABLE_LIST_MODE;
        if (dropdownOpenOnMobile) {
            onVariableFocus?.(variable.id);
        } else {
            onVariableBlur?.(variable.id);
        }
    }, [isMobileSize, activePanel, variable.id, onVariableFocus, onVariableBlur]);

    if (!configuredConnector) {
        return null;
    }

    if (isMobileSize) {
        return activePanel === PanelType.DATA_SOURCE_VARIABLE_LIST_MODE ? (
            <MobileDataSourceListModeOptions
                options={options}
                selectedValue={selectedValue}
                onChange={handleRowSelected}
                hasPreviousPage={hasPreviousPage}
                hasNextPage={hasNextPage}
                previousPageLoading={isPreviousPageLoading}
                nextPageLoading={isNextPageLoading}
                onPreviousPageRequested={loadPreviousPage}
                onNextPageRequested={loadNextPage}
            />
        ) : (
            <MobileDataSourceListModeControl
                selectedValue={selectedValue}
                variable={variable}
                validationError={validationError}
                isLoading={isNextPageLoading || isPreviousPageLoading}
            />
        );
    }

    return (
        <HelpTextWrapper>
            <Select
                enablePagination
                value={options.find((option) => option.value?.toString() === variable.entryId?.toString()) ?? null}
                options={options}
                label={variable.label ?? variable.name}
                placeholder={placeholder}
                onLoadPage={handlePageRequested}
                onChange={(value) => handleRowSelected(value?.value?.toString() ?? '')}
                dropDownIcon={AvailableIcons.faTable}
                {...(dataRows.length > 0 && { initialHasPreviousPage: hasPreviousPage })}
                {...(dataRows.length > 0 && { initialHasNextPage: hasNextPage })}
                onMenuOpen={() => {
                    setIsDropdownOpen(true);
                }}
                onMenuClose={() => {
                    setIsDropdownOpen(false);
                }}
            />
            {variable.helpText && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
};

export default DataSourceVariableListMode;

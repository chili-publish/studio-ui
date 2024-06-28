import { useEffect, useState } from 'react';
import { DateVariable as DateVariableType, Variable, VariableType } from '@chili-publish/studio-sdk';
import { Option, useMobileSize, Button, ButtonVariant } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import {
    ComponentWrapper,
    DatePickerWrapper,
    VariablesListWrapper,
    VariablesPanelTitle,
} from './VariablesPanel.styles';
import StudioDropdown from '../shared/StudioDropdown';
import DateVariable from '../variablesComponents/DateVariable';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';

interface VariablesListProps {
    variables: Variable[];
    onMobileOptionListToggle?: (_: boolean) => void;
    isDocumentLoaded: boolean;
}

const isListVariable = (variable: Variable): variable is ListVariable => variable.type === VariableType.list;

function VariablesList({ variables, onMobileOptionListToggle, isDocumentLoaded }: VariablesListProps) {
    const { contentType, showVariablesPanel, showDatePicker } = useVariablePanelContext();

    const isMobileSize = useMobileSize();
    const [listVariableOpen, setListVariableOpen] = useState<ListVariable | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>();

    const updateVariableValue = async (variableId: string, value: string) => {
        await window.SDK.variable.setValue(variableId, value);
    };

    useEffect(() => {
        if (onMobileOptionListToggle) onMobileOptionListToggle(!!listVariableOpen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listVariableOpen]);

    return (
        <VariablesListWrapper optionsListOpen={!!listVariableOpen}>
            {!isMobileSize && <VariablesPanelTitle>Customize</VariablesPanelTitle>}
            {variables.length > 0 &&
                variables.map((variable: Variable) => {
                    if (!variable.isVisible) return null;

                    const isListVariabledDisplayed =
                        !listVariableOpen || (listVariableOpen && variable.id === listVariableOpen.id);
                    if (
                        isListVariable(variable) &&
                        isListVariabledDisplayed &&
                        contentType !== ContentType.DATE_VARIABLE_PICKER
                    ) {
                        const variableItem = listVariableOpen || variable;
                        const options = variableItem.items.map((item) => ({
                            label: item.displayValue || item.value,
                            value: item.value,
                        }));
                        const selectedValue = variableItem.selected
                            ? {
                                  label: variableItem.selected.displayValue || variableItem.selected.value,
                                  value: variableItem.selected.value,
                              }
                            : ('' as unknown as Option);
                        return (
                            <ComponentWrapper
                                key={`variable-component-${variable.id}`}
                                data-intercom-target={`dropdown-variable-${variable.name}`}
                            >
                                <StudioDropdown
                                    dataId={variable.id}
                                    label={variable.name}
                                    selectedValue={selectedValue || ''}
                                    options={options}
                                    onChange={(val) => updateVariableValue(variable.id, val)}
                                    onMenuOpen={() => setListVariableOpen(variable)}
                                    onMenuClose={() => setListVariableOpen(null)}
                                />
                            </ComponentWrapper>
                        );
                    }
                    const isDateVariableOpen =
                        variable.type === VariableType.date && contentType === ContentType.DATE_VARIABLE_PICKER;
                    if (isDateVariableOpen && !listVariableOpen && isMobileSize) {
                        return (
                            <>
                                <DatePickerWrapper>
                                    <DateVariable
                                        key={variable.id}
                                        variable={variable as DateVariableType}
                                        inline
                                        selected={selectedDate}
                                        setDate={(val) => {
                                            setSelectedDate(new Date(val));
                                        }}
                                    />
                                </DatePickerWrapper>
                                <Button
                                    dataId={getDataIdForSUI(`date-confirm-btn`)}
                                    dataTestId={getDataTestIdForSUI(`date-confirm-btn`)}
                                    onClick={() => {
                                        if (selectedDate) {
                                            updateVariableValue(variable.id, selectedDate?.toISOString().split('T')[0]);
                                            showVariablesPanel();
                                        }
                                    }}
                                    variant={ButtonVariant.primary}
                                    label="Confirm"
                                    styles={css`
                                        width: 100%;
                                    `}
                                />
                            </>
                        );
                    }
                    return !listVariableOpen && contentType !== ContentType.DATE_VARIABLE_PICKER ? (
                        <ComponentWrapper key={`variable-component-${variable.id}`}>
                            <VariablesComponents
                                type={variable.type}
                                variable={variable}
                                isDocumentLoaded={isDocumentLoaded}
                                onCalendarOpen={() => {
                                    showDatePicker();
                                }}
                            />
                        </ComponentWrapper>
                    ) : null;
                })}
        </VariablesListWrapper>
    );
}

export default VariablesList;

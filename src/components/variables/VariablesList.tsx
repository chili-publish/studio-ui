import { useEffect, useState } from 'react';
import { DateVariable as DateVariableType, Variable, VariableType } from '@chili-publish/studio-sdk';
import { Option, useMobileSize, InputLabel } from '@chili-publish/grafx-shared-components';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { ComponentWrapper, VariablesListWrapper, VariablesPanelTitle } from './VariablesPanel.styles';
import StudioDropdown from '../shared/StudioDropdown';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import { HelpTextWrapper } from '../variablesComponents/VariablesComponents.styles';
import DateVariableMobile from '../variablesComponents/dateVariable/DateVariableMobile';
import { getVariablePlaceholder } from '../variablesComponents/variablePlaceholder.util';

interface VariablesListProps {
    variables: Variable[];
    onMobileOptionListToggle?: (_: boolean) => void;
    isDocumentLoaded: boolean;
}

const isListVariable = (variable: Variable): variable is ListVariable => variable.type === VariableType.list;

function VariablesList({ variables, onMobileOptionListToggle, isDocumentLoaded }: VariablesListProps) {
    const { contentType, showVariablesPanel, showDatePicker, currentVariableId } = useVariablePanelContext();

    const isMobileSize = useMobileSize();
    const [listVariableOpen, setListVariableOpen] = useState<ListVariable | null>(null);

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
                        const placeholder = getVariablePlaceholder(variable);

                        return (
                            <ComponentWrapper
                                key={`variable-component-${variable.id}`}
                                data-intercom-target={`dropdown-variable-${variable.name}`}
                            >
                                <HelpTextWrapper>
                                    <div>
                                        <StudioDropdown
                                            dataId={variable.id}
                                            label={variable.name}
                                            selectedValue={selectedValue || ''}
                                            options={options}
                                            placeholder={placeholder}
                                            onChange={(val) => updateVariableValue(variable.id, val)}
                                            onMenuOpen={() => setListVariableOpen(variable)}
                                            onMenuClose={() => setListVariableOpen(null)}
                                        />
                                    </div>
                                    {variable.helpText && !listVariableOpen ? (
                                        <InputLabel labelFor={variable.id} label={variable.helpText} />
                                    ) : null}
                                </HelpTextWrapper>
                            </ComponentWrapper>
                        );
                    }
                    const isDateVariableOpen =
                        variable.type === VariableType.date &&
                        contentType === ContentType.DATE_VARIABLE_PICKER &&
                        currentVariableId === variable.id;
                    if (isDateVariableOpen && !listVariableOpen && isMobileSize) {
                        return (
                            <DateVariableMobile
                                key={variable.id}
                                variable={variable as DateVariableType}
                                onDateSelected={() => showVariablesPanel()}
                            />
                        );
                    }
                    return !listVariableOpen && contentType !== ContentType.DATE_VARIABLE_PICKER ? (
                        <ComponentWrapper key={`variable-component-${variable.id}`}>
                            <VariablesComponents
                                type={variable.type}
                                variable={variable}
                                isDocumentLoaded={isDocumentLoaded}
                                onCalendarOpen={() => {
                                    if (variable.type === VariableType.date)
                                        showDatePicker(variable as DateVariableType);
                                }}
                            />
                        </ComponentWrapper>
                    ) : null;
                })}
        </VariablesListWrapper>
    );
}

export default VariablesList;

import { InputLabel } from '@chili-publish/grafx-shared-components';
import { DateVariable as DateVariableType, Variable, VariableType } from '@chili-publish/studio-sdk';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';
import { useCallback, useEffect, useState } from 'react';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import DateVariableMobile from '../variablesComponents/dateVariable/DateVariableMobile';
import MobileListVariable from '../variablesComponents/listVariable/MobileListVariable';
import { isListVariable } from '../variablesComponents/Variable';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { HelpTextWrapper } from '../variablesComponents/VariablesComponents.styles';
import { ComponentWrapper, VariablesListWrapper } from './VariablesPanel.styles';

interface VariablesListProps {
    variables: Variable[];
    onMobileOptionListToggle?: (_: boolean) => void;
}

function MobileVariablesList({ variables, onMobileOptionListToggle }: VariablesListProps) {
    const { contentType, showVariablesPanel, showDatePicker, currentVariableId, validateUpdatedVariables } =
        useVariablePanelContext();
    const { variablesValidation, validateVariable } = useVariablePanelContext();

    const [listVariableOpen, setListVariableOpen] = useState<ListVariable | null>(null);

    useEffect(() => {
        if (onMobileOptionListToggle) onMobileOptionListToggle(!!listVariableOpen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listVariableOpen]);

    useEffect(() => {
        validateUpdatedVariables();
    }, [variables, validateUpdatedVariables]);

    const handleDateSelected = useCallback(
        (variable: Variable) => {
            validateVariable(variable);
            showVariablesPanel();
        },
        [showVariablesPanel, validateVariable],
    );

    return (
        <VariablesListWrapper optionsListOpen={!!listVariableOpen}>
            {variables.length > 0 &&
                variables.map((variable: Variable) => {
                    if (!variable.isVisible) return null;

                    const errMsg = variablesValidation?.[variable.id]?.errorMsg;
                    const isListVariabledDisplayed =
                        !listVariableOpen || (listVariableOpen && variable.id === listVariableOpen.id);

                    if (
                        isListVariable(variable) &&
                        isListVariabledDisplayed &&
                        contentType !== ContentType.DATE_VARIABLE_PICKER
                    ) {
                        return (
                            <ComponentWrapper
                                key={`variable-component-${variable.id}`}
                                data-intercom-target={`dropdown-variable-${variable.name}`}
                            >
                                <HelpTextWrapper>
                                    <div>
                                        <MobileListVariable
                                            variable={variable}
                                            validationError={errMsg}
                                            onItemSelected={validateVariable}
                                            onMenuOpen={() => setListVariableOpen(variable)}
                                            onMenuClose={() => setListVariableOpen(null)}
                                        />
                                    </div>
                                    {variable.helpText && !listVariableOpen && !errMsg ? (
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

                    if (isDateVariableOpen && !listVariableOpen) {
                        return (
                            <DateVariableMobile
                                key={variable.id}
                                variable={variable as DateVariableType}
                                onDateSelected={handleDateSelected}
                            />
                        );
                    }
                    return !listVariableOpen && contentType !== ContentType.DATE_VARIABLE_PICKER ? (
                        <ComponentWrapper key={`variable-component-${variable.id}`}>
                            <VariablesComponents
                                type={variable.type}
                                variable={variable}
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

export default MobileVariablesList;

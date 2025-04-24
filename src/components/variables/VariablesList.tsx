import { DateVariable, DateVariable as DateVariableType, Variable, VariableType } from '@chili-publish/studio-sdk';
import { useCallback, useEffect } from 'react';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import { PanelTitle, SectionHelpText, SectionWrapper } from '../shared/Panel.styles';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { ComponentWrapper, ListWrapper } from './VariablesPanel.styles';
import { useUserInterfaceDetailsContext } from '../navbar/UserInterfaceDetailsContext';

interface VariablesListProps {
    variables: Variable[];
}

function VariablesList({ variables }: VariablesListProps) {
    const { contentType, showDatePicker, validateUpdatedVariables } = useVariablePanelContext();
    const { formBuilder } = useUserInterfaceDetailsContext();
    const handleCalendarOpen = useCallback(
        (variable: DateVariable) => {
            if (variable.type === VariableType.date) showDatePicker(variable as DateVariableType);
        },
        [showDatePicker],
    );

    useEffect(() => {
        validateUpdatedVariables();
    }, [validateUpdatedVariables]);

    return formBuilder.variables.active ? (
        <ListWrapper>
            <SectionWrapper id="variables-section-header">
                <PanelTitle margin="0">{formBuilder.variables.header}</PanelTitle>
                {formBuilder.variables.helpText && <SectionHelpText>{formBuilder.variables.helpText}</SectionHelpText>}
            </SectionWrapper>
            {variables.length > 0 &&
                variables.map((variable: Variable) => {
                    if (!variable.isVisible) return null;
                    return contentType !== ContentType.DATE_VARIABLE_PICKER ? (
                        <ComponentWrapper key={`variable-component-${variable.id}`}>
                            <VariablesComponents
                                type={variable.type}
                                variable={variable}
                                onCalendarOpen={handleCalendarOpen}
                            />
                        </ComponentWrapper>
                    ) : null;
                })}
        </ListWrapper>
    ) : null;
}

export default VariablesList;

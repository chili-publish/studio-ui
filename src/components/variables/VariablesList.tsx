import { DateVariable, DateVariable as DateVariableType, Variable, VariableType } from '@chili-publish/studio-sdk';
import { useCallback, useEffect } from 'react';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import { PanelTitle } from '../shared/Panel.styles';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { ComponentWrapper, VariablesListWrapper } from './VariablesPanel.styles';

interface VariablesListProps {
    variables: Variable[];
}

function VariablesList({ variables }: VariablesListProps) {
    const { contentType, showDatePicker, validateUpdatedVariables } = useVariablePanelContext();
    const handleCalendarOpen = useCallback(
        (variable: DateVariable) => {
            if (variable.type === VariableType.date) showDatePicker(variable as DateVariableType);
        },
        [showDatePicker],
    );

    useEffect(() => {
        validateUpdatedVariables();
    }, [variables, validateUpdatedVariables]);

    return (
        <VariablesListWrapper>
            <PanelTitle>Customize</PanelTitle>
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
        </VariablesListWrapper>
    );
}

export default VariablesList;

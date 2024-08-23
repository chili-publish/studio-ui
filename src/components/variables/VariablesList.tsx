import { useCallback, useEffect } from 'react';
import { DateVariable, DateVariable as DateVariableType, Variable, VariableType } from '@chili-publish/studio-sdk';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { ComponentWrapper, VariablesListWrapper, VariablesPanelTitle } from './VariablesPanel.styles';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';

interface VariablesListProps {
    variables: Variable[];
    isDocumentLoaded: boolean;
}

function VariablesList({ variables, isDocumentLoaded }: VariablesListProps) {
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
            <VariablesPanelTitle>Customize</VariablesPanelTitle>
            {variables.length > 0 &&
                variables.map((variable: Variable) => {
                    if (!variable.isVisible) return null;
                    return contentType !== ContentType.DATE_VARIABLE_PICKER ? (
                        <ComponentWrapper key={`variable-component-${variable.id}`}>
                            <VariablesComponents
                                type={variable.type}
                                variable={variable}
                                isDocumentLoaded={isDocumentLoaded}
                                onCalendarOpen={handleCalendarOpen}
                            />
                        </ComponentWrapper>
                    ) : null;
                })}
        </VariablesListWrapper>
    );
}

export default VariablesList;

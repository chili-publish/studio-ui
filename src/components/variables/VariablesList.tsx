import { DateVariable, DateVariable as DateVariableType, Variable, VariableType } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useMemo } from 'react';
import { useVariableTranslations } from 'src/core/hooks/useVariableTranslations';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import { useUserInterfaceDetailsContext } from '../navbar/UserInterfaceDetailsContext';
import { PanelTitle, SectionHelpText, SectionWrapper } from '../shared/Panel.styles';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { ComponentWrapper, ListWrapper } from './VariablesPanel.styles';

interface VariablesListProps {
    variables: Variable[];
}

function VariablesList({ variables }: VariablesListProps) {
    const { contentType, showDatePicker, validateUpdatedVariables } = useVariablePanelContext();
    const { formBuilder } = useUserInterfaceDetailsContext();
    const { updateWithTranslation } = useVariableTranslations();
    const handleCalendarOpen = useCallback(
        (variable: DateVariable) => {
            if (variable.type === VariableType.date) showDatePicker(variable as DateVariableType);
        },
        [showDatePicker],
    );

    useEffect(() => {
        validateUpdatedVariables();
    }, [validateUpdatedVariables]);

    const variablesWithTranslation = useMemo(() => {
        return variables.map((variable) => updateWithTranslation(variable));
    }, [variables, updateWithTranslation]);

    return (
        <ListWrapper>
            <SectionWrapper id="variables-section-header">
                <PanelTitle margin="0">{formBuilder.variables.header}</PanelTitle>
                {formBuilder.variables.helpText && <SectionHelpText>{formBuilder.variables.helpText}</SectionHelpText>}
            </SectionWrapper>
            {variablesWithTranslation.map((variable: Variable) => {
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
    );
}

export default VariablesList;

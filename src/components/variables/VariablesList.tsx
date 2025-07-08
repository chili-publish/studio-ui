import { DateVariable, Variable, VariableType } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useMemo } from 'react';
import { useVariableTranslations } from 'src/core/hooks/useVariableTranslations';
import { useSelector } from 'react-redux';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { PanelType } from '../../contexts/VariablePanelContext.types';
import { useUserInterfaceDetailsContext } from '../navbar/UserInterfaceDetailsContext';
import { PanelTitle, SectionHelpText, SectionWrapper } from '../shared/Panel.styles';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { ComponentWrapper, ListWrapper } from './VariablesPanel.styles';
import { selectCurrentPanel, showDatePickerPanel } from '../../store/reducers/panelReducer';
import { useAppDispatch } from '../../store';

interface VariablesListProps {
    variables: Variable[];
}

function VariablesList({ variables }: VariablesListProps) {
    const currentPanel = useSelector(selectCurrentPanel);
    const dispatch = useAppDispatch();
    const { validateUpdatedVariables } = useVariablePanelContext();
    const { formBuilder } = useUserInterfaceDetailsContext();
    const { updateWithTranslation } = useVariableTranslations();
    const handleCalendarOpen = useCallback(
        (variable: DateVariable) => {
            if (variable.type === VariableType.date) dispatch(showDatePickerPanel({ variableId: variable.id }));
        },
        [dispatch],
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
                return currentPanel !== PanelType.DATE_VARIABLE_PICKER ? (
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

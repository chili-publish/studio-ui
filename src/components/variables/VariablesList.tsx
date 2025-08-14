import { DateVariable, Variable, VariableType } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useVariableTranslations } from '../../core/hooks/useVariableTranslations';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import { useUserInterfaceDetailsContext } from '../navbar/UserInterfaceDetailsContext';
import { PanelTitle, SectionHelpText, SectionWrapper } from '../shared/Panel.styles';
import VariablesComponents from '../variablesComponents/VariablesComponents';
import { ComponentWrapper } from './VariablesPanel.styles';
import { PanelType, selectActivePanel, showDatePickerPanel } from '../../store/reducers/panelReducer';
import { useAppDispatch } from '../../store';
import { selectVariables, validateUpdatedVariables } from '../../store/reducers/variableReducer';
import { useVariableHistory } from '../dataSource/useVariableHistory';

function VariablesList() {
    const activePanel = useSelector(selectActivePanel);
    const variables = useSelector(selectVariables);

    const dispatch = useAppDispatch();
    const { formBuilder } = useUserInterfaceDetailsContext();
    const { updateWithTranslation } = useVariableTranslations();
    const { getUITranslation } = useUITranslations();
    const handleCalendarOpen = useCallback(
        (variable: DateVariable) => {
            if (variable.type === VariableType.date) dispatch(showDatePickerPanel({ variableId: variable.id }));
        },
        [dispatch],
    );
    const { hasChanged: variablesChanged } = useVariableHistory();

    useEffect(() => {
        if (variablesChanged) dispatch(validateUpdatedVariables());
    }, [variablesChanged, dispatch]);

    const variablesWithTranslation = useMemo(() => {
        return variables.map((variable) => updateWithTranslation(variable));
    }, [variables, updateWithTranslation]);

    const header = getUITranslation(['formBuilder', 'variables', 'header'], formBuilder.variables.header);
    const helpText = getUITranslation(['formBuilder', 'variables', 'helpText'], formBuilder.variables.helpText);

    return (
        <div>
            <SectionWrapper id="variables-section-header">
                <PanelTitle margin="0">{header}</PanelTitle>
                {helpText && <SectionHelpText>{helpText}</SectionHelpText>}
            </SectionWrapper>
            {variablesWithTranslation.map((variable: Variable) => {
                if (!variable.isVisible) return null;
                return activePanel !== PanelType.DATE_VARIABLE_PICKER ? (
                    <ComponentWrapper key={`variable-component-${variable.id}`}>
                        <VariablesComponents
                            type={variable.type}
                            variable={variable}
                            onCalendarOpen={handleCalendarOpen}
                        />
                    </ComponentWrapper>
                ) : null;
            })}
        </div>
    );
}

export default VariablesList;

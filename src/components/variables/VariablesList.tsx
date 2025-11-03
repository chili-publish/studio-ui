import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useVariableTranslations } from '../../core/hooks/useVariableTranslations';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import { useUserInterfaceDetailsContext } from '../navbar/UserInterfaceDetailsContext';
import { PanelTitle, SectionHelpText, SectionWrapper } from '../shared/Panel.styles';
import { useAppDispatch } from '../../store';
import { selectVariables, validateUpdatedVariables } from '../../store/reducers/variableReducer';
import { useVariableHistory } from '../dataSource/useVariableHistory';
import FlatVariablesList from './FlatVariablesList';
import GroupVariablesList from './GroupVariablesList';

function VariablesList() {
    const variables = useSelector(selectVariables);

    const dispatch = useAppDispatch();
    const { formBuilder } = useUserInterfaceDetailsContext();
    const { updateWithTranslation } = useVariableTranslations();
    const { getUITranslation } = useUITranslations();
    const { hasChanged: variablesChanged } = useVariableHistory();

    useEffect(() => {
        if (variablesChanged) dispatch(validateUpdatedVariables());
    }, [variablesChanged, dispatch]);

    const variablesWithTranslation = useMemo(() => {
        return variables.map((variable) => updateWithTranslation(variable));
    }, [variables, updateWithTranslation]);

    const header = getUITranslation(['formBuilder', 'variables', 'header'], formBuilder.variables.header);
    const helpText = getUITranslation(['formBuilder', 'variables', 'helpText'], formBuilder.variables.helpText);
    const showVaribleGroup = formBuilder.variables?.variableGroups?.show || false;

    return (
        <div>
            <SectionWrapper id="variables-section-header">
                <PanelTitle margin="0">{header}</PanelTitle>
                {helpText && <SectionHelpText>{helpText}</SectionHelpText>}
            </SectionWrapper>
            {showVaribleGroup ? (
                <GroupVariablesList variables={variablesWithTranslation} childrenListComponent={FlatVariablesList} />
            ) : (
                <FlatVariablesList variables={variablesWithTranslation} />
            )}
        </div>
    );
}

export default VariablesList;

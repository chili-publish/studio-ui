import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useVariableTranslations } from '../../../core/hooks/useVariableTranslations';
import { useAppDispatch } from '../../../store';
import { selectVariables, validateUpdatedVariables } from '../../../store/reducers/variableReducer';
import { useVariableHistory } from '../../dataSource/useVariableHistory';
import MobileFlatVariablesList from './MobileFlatVariablesList';
import { useUserInterfaceDetailsContext } from '../../navbar/UserInterfaceDetailsContext';
import GroupVariablesList from '../GroupVariablesList';

interface VariablesListProps {
    onMobileOptionListToggle?: (_: boolean) => void;
}

function MobileVariablesList({ onMobileOptionListToggle }: VariablesListProps) {
    const dispatch = useAppDispatch();

    const { formBuilder } = useUserInterfaceDetailsContext();

    const variables = useSelector(selectVariables);
    const { updateWithTranslation } = useVariableTranslations();
    const { hasChanged: variablesChanged } = useVariableHistory();

    useEffect(() => {
        if (variablesChanged) dispatch(validateUpdatedVariables());
    }, [variablesChanged, dispatch]);

    const variablesWithTranslation = useMemo(() => {
        return variables.map((variable) => updateWithTranslation(variable));
    }, [variables, updateWithTranslation]);

    const showVaribleGroup = formBuilder.variables?.variableGroups?.show || false;

    return showVaribleGroup ? (
        <GroupVariablesList variables={variablesWithTranslation} groupChildren={MobileFlatVariablesList} />
    ) : (
        <MobileFlatVariablesList
            variables={variablesWithTranslation}
            onMobileOptionListToggle={onMobileOptionListToggle}
        />
    );
}

export default MobileVariablesList;

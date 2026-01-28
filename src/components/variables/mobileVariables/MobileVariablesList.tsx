import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useVariableTranslations } from '../../../core/hooks/useVariableTranslations';
import { useAppDispatch } from '../../../store';
import { selectVariables, validateUpdatedVariables } from '../../../store/reducers/variableReducer';
import { useVariableHistory } from '../../dataSource/useVariableHistory';
import MobileFlatVariablesList from './MobileFlatVariablesList';
import { useUserInterfaceDetailsContext } from '../../navbar/UserInterfaceDetailsContext';
import GroupVariablesList from '../GroupVariablesList';

function MobileVariablesList() {
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

    const showVariableGroup = formBuilder.variables?.variableGroups?.show || false;

    return showVariableGroup ? (
        <GroupVariablesList variables={variablesWithTranslation} childrenListComponent={MobileFlatVariablesList} />
    ) : (
        <MobileFlatVariablesList variables={variablesWithTranslation} />
    );
}

export default MobileVariablesList;

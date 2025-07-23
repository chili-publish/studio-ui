import { Variable } from '@chili-publish/studio-sdk';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectVariables } from '../../store/reducers/variableReducer';

export const useVariableHistory = () => {
    const currentVariables = useSelector(selectVariables);
    const [previousVariables, setPreviousVariables] = useState<Variable[]>([]);

    useEffect(() => {
        setPreviousVariables(currentVariables);
    }, [currentVariables]);

    const hasChanged = useMemo(() => {
        return currentVariables !== previousVariables;
    }, [currentVariables, previousVariables]);

    return {
        hasChanged,
    };
};

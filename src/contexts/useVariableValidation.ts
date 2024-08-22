import { Variable } from '@chili-publish/studio-sdk';
import { useCallback, useState } from 'react';
import { VariableValidation } from './VariablePanelContext.types';
import { getVariableErrMsg } from '../components/variablesComponents/Variable';

export const useVariableValidation = (variables: Variable[]) => {
    const [variablesValidation, setVariablesValidation] = useState<VariableValidation>({});

    const validateVariables = useCallback(() => {
        let hasErrors = false;
        setVariablesValidation((prev) =>
            variables.reduce((acc, current) => {
                const errMsg = getVariableErrMsg(current);
                if (errMsg) hasErrors = true;

                return {
                    ...acc,
                    [current.id]: {
                        errorMsg: errMsg,
                        isTouched: prev[current.id]?.isTouched,
                    },
                };
            }, {}),
        );
        return hasErrors;
    }, [variables]);

    const validateUpdatedVariables = useCallback(() => {
        let hasErrors = false;
        setVariablesValidation((prev) =>
            variables.reduce((acc, current) => {
                if (!!prev[current.id] && prev[current.id].isTouched) {
                    const errMsg = getVariableErrMsg(current);
                    if (errMsg) hasErrors = true;

                    const currentConfig = prev[current.id];

                    return {
                        ...acc,
                        [current.id]: {
                            ...(currentConfig || {}),
                            errorMsg: errMsg,
                        },
                    };
                }
                return { ...acc, [current.id]: prev[current.id] };
            }, {}),
        );
        return hasErrors;
    }, [variables]);

    const validateVariable = useCallback((variable: Variable) => {
        setVariablesValidation((prev) => ({
            ...prev,
            [variable.id]: {
                errorMsg: getVariableErrMsg(variable),
                isTouched: true,
            },
        }));
    }, []);

    const getVariableError = useCallback(
        (variable: Variable): string => {
            if (variablesValidation[variable.id]) {
                return variablesValidation[variable.id].errorMsg;
            }
            return '';
        },
        [variablesValidation],
    );

    return {
        variablesValidation,
        validateVariable,
        validateVariables,
        validateUpdatedVariables,
        getVariableError,
    };
};

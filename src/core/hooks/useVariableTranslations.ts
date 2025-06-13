import { Variable } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';

export const useVariableTranslations = () => {
    const { variableTranslations } = useVariablePanelContext();

    const updateWithTranslation = useCallback(
        (variable: Variable): Variable => {
            const translation = variable.label ? variableTranslations[variable.label] : undefined;
            if (!translation) {
                return variable;
            }

            return {
                ...variable,
                label: translation.label ?? variable.label,
                placeholder: translation.placeholder ?? variable.placeholder,
                helpText: translation.helpText ?? variable.helpText,
            };
        },
        [variableTranslations],
    );

    return {
        updateWithTranslation,
    };
};

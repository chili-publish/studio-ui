import { Variable } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectVariableTranslations } from 'src/store/reducers/appConfigReducer';

export const useVariableTranslations = () => {
    const variableTranslations = useSelector(selectVariableTranslations);

    const updateWithTranslation = useCallback(
        (variable: Variable): Variable => {
            const translation = variable.label ? variableTranslations?.[variable.label] : undefined;
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

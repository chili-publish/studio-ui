import { Variable } from '@chili-publish/studio-sdk';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';
import { useCallback } from 'react';
import { isListVariable } from 'src/components/variablesComponents/Variable';
import { BaseVariableTranslation, ListVariableTranslation } from 'src/types/VariableTranslations';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';

function updateVariableWithTranslation<V extends Variable>(variable: V, translation: BaseVariableTranslation): V {
    return {
        ...variable,
        label: translation.label ?? variable.label,
        placeholder: translation.placeholder ?? variable.placeholder,
        helpText: translation.helpText ?? variable.helpText,
    };
}

function updateListVariableWithTranslation(variable: ListVariable, translation: ListVariableTranslation): ListVariable {
    return {
        ...variable,
        items: variable.items.map((item) => ({
            ...item,
            displayValue: item.displayValue
                ? (translation.listItems?.[item.displayValue] ?? item.displayValue)
                : item.displayValue,
        })),
    };
}
export const useVariableTranslations = () => {
    const { variableTranslations } = useVariablePanelContext();

    const updateWithTranslation = useCallback(
        (variable: Variable): Variable => {
            const translation = variable.label ? variableTranslations[variable.label] : undefined;
            if (!translation) {
                return variable;
            }

            const variableWithTranslation = updateVariableWithTranslation(variable, translation);

            if (isListVariable(variableWithTranslation)) {
                return updateListVariableWithTranslation(variableWithTranslation, translation);
            }

            return variableWithTranslation;
        },
        [variableTranslations],
    );

    return {
        updateWithTranslation,
    };
};

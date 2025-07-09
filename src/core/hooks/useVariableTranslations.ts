import { ListVariableItem, Variable } from '@chili-publish/studio-sdk';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';
import { useCallback } from 'react';
import { isListVariable } from 'src/components/variablesComponents/Variable';
import { BaseVariableTranslation, ListVariableTranslation } from 'src/types/VariableTranslations';
import { useSelector } from 'react-redux';
import { selectVariableTranslations } from 'src/store/reducers/appConfigReducer';

function updateGenericVariableWithTranslation<V extends Variable>(
    variable: V,
    translation: BaseVariableTranslation,
): V {
    return {
        ...variable,
        label: translation.label ?? variable.label,
        placeholder: translation.placeholder ?? variable.placeholder,
        helpText: translation.helpText ?? variable.helpText,
    };
}

function updateVariableWithTranslation<V extends Variable>(variable: V, translation: BaseVariableTranslation): V {
    const variableWithTranslation = updateGenericVariableWithTranslation(variable, translation);

    if (isListVariable(variableWithTranslation)) {
        return updateListVariableWithTranslation(variableWithTranslation, translation);
    }

    return variableWithTranslation;
}

function updateListVariableWithTranslation<V extends ListVariable>(
    variable: V,
    translation: ListVariableTranslation,
): V {
    function updateItem(item: ListVariableItem) {
        let listItemTranslation = item.displayValue ? translation.listItems?.[item.displayValue] : undefined;
        if (!listItemTranslation) {
            listItemTranslation = translation.listItems?.[item.value];
        }
        return listItemTranslation ? { ...item, displayValue: listItemTranslation } : item;
    }

    return {
        ...variable,
        items: variable.items.map((item) => updateItem(item)),
        selected: variable.selected ? updateItem(variable.selected) : variable.selected,
    };
}
export const useVariableTranslations = () => {
    const variableTranslations = useSelector(selectVariableTranslations);

    const updateWithTranslation = useCallback(
        (variable: Variable): Variable => {
            let translation = variable.label ? variableTranslations?.[variable.label] : undefined;
            if (!translation) {
                // Try using variable.name if translation is not found with variable.label
                translation = variableTranslations?.[variable.name];
            }

            return translation ? updateVariableWithTranslation(variable, translation) : variable;
        },
        [variableTranslations],
    );

    return {
        updateWithTranslation,
    };
};

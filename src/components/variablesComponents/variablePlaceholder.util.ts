import { Variable, VariableType } from '@chili-publish/studio-sdk';

export const getVariablePlaceholder = (variable: Variable) => {
    const getTranslationKey = (item: Variable) => {
        switch (item.type) {
            case VariableType.date:
                return 'Select date';
            case VariableType.image:
                return 'Select image';
            case VariableType.list:
                return 'Select item';
            case VariableType.longText:
            case VariableType.shortText:
                return 'Enter text';
            default:
                return '';
        }
    };
    return variable.placeholder === null || variable.placeholder === undefined
        ? getTranslationKey(variable)
        : variable.placeholder;
};

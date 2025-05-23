import { ImageVariable, Variable, VariableType } from '@chili-publish/studio-sdk';

export const getVariablePlaceholder = (variable: Variable) => {
    const getText = (item: Variable) => {
        switch (item.type) {
            case VariableType.date:
                return 'Select date';
            case VariableType.list:
                return 'Select item';
            case VariableType.longText:
            case VariableType.shortText:
                return 'Enter text';
            default:
                return '';
        }
    };
    return variable.placeholder ?? getText(variable);
};

export const getImageVariablePlaceholder = (imageVariable: ImageVariable): string => {
    // Get the base placeholder
    const basicPlaceholder = getVariablePlaceholder(imageVariable);

    // Use the provided placeholder if available
    if (basicPlaceholder) {
        return basicPlaceholder;
    }

    // Otherwise, use specific placeholders based on allowed operations
    if (imageVariable.allowUpload && !imageVariable.allowQuery) {
        return 'Upload an image';
    }

    if (imageVariable.allowQuery) {
        return 'Select image';
    }
    return '';
};

export const getImageVariablePendingLabel = (uploadPending: boolean): string => {
    return uploadPending ? 'Uploading image' : 'Loading preview...';
};

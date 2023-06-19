import { Id, ImageVariableSource } from '@chili-publish/studio-sdk';

// NOTE(@pkgacek): this is an custom hook to handle updating components. Currently it
// is only a boiler plate to be expanded upon in the future.
export const useVariableComponents = (currentVariableId: Id) => {
    const closePanel = () => null;

    /* TODO: Update to use setVariableValue when SDK version goes to 0.125.0 or higher */
    const handleImageChange = async (src: ImageVariableSource) => {
        if (currentVariableId) {
            const result = await window.SDK.variable.setVariableSource(currentVariableId, src);
            return result;
        }
        return null;
    };

    /* TODO: Update to use setVariableValue when SDK version goes to 0.125.0 or higher */
    const handleImageRemove = async () => {
        if (currentVariableId) {
            const result = await window.SDK.variable.removeVariableSource(currentVariableId);
            return result;
        }
        return null;
    };

    const handleValueChange = async (value: string) => {
        // This is only for testing purposes
        await window.SDK.variable.setVariableValue(currentVariableId, value);
    };

    return {
        handleImageChange,
        handleImageRemove,
        handleValueChange,
        closePanel,
    };
};

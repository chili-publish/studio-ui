import { Id, ImageVariableSource } from '@chili-publish/studio-sdk';

// NOTE(@pkgacek): this is an custom hook to handle updating components. Currently it
// is only a boiler plate to be expanded upon in the future.
export const useVariableComponents = (currentVariableId: Id) => {
    const closePanel = () => null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleImageChange = (source: ImageVariableSource) => null;

    const handleImageRemove = () => null;

    const handleValueChange = async (value: string) => {
        // This is only for testing purposes
        await window.SDK.variable.setValue(currentVariableId, value);
    };

    return {
        handleImageChange,
        handleImageRemove,
        handleValueChange,
        closePanel,
    };
};

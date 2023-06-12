/* eslint-disable no-console */
import { Id, ImageVariableSource } from '@chili-publish/studio-sdk';

export const useVariableComponents = (currentVariableId: Id) => {
    const closePanel = () => null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleImageChange = (source: ImageVariableSource) => null;

    const handleImageRemove = () => null;

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

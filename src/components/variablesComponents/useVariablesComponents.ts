import { Id, ImageVariableSource, MediaConnectorImageVariableSource } from '@chili-publish/studio-sdk';

export const useVariableComponents = (currentVariableId: Id) => {
    const closePanel = () => null;

    const handleImageChange = async (src: ImageVariableSource) => {
        if (currentVariableId) {
            const assetId = (src as MediaConnectorImageVariableSource).assetId ?? null;
            const result = await window.SDK.variable.setValue(currentVariableId, assetId);
            return result;
        }
        return null;
    };

    const handleImageRemove = async () => {
        if (currentVariableId) {
            const result = await window.SDK.variable.setValue(currentVariableId, null);
            return result;
        }
        return null;
    };

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

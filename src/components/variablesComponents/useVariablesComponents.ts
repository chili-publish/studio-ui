import { ConnectorImageVariableSource, Id } from '@chili-publish/studio-sdk';

export const useVariableComponents = (currentVariableId: Id) => {
    const closePanel = () => null;

    const handleImageChange = async (value: ConnectorImageVariableSource) => {
        if (currentVariableId) {
            const assetId = value.resolved?.mediaId ?? value.assetId ?? null;
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

    const handleValueChange = async (value: string | boolean | number) => {
        if (!currentVariableId) return null;
        return window.SDK.variable.setValue(currentVariableId, value);
    };

    return {
        handleImageChange,
        handleImageRemove,
        handleValueChange,
        closePanel,
    };
};

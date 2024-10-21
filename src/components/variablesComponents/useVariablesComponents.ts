import { ConnectorImageVariableSource, Id } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';

export const useVariableComponents = (currentVariableId: Id) => {
    const handleImageChange = useCallback(
        async (value: ConnectorImageVariableSource) => {
            if (currentVariableId) {
                const assetId = value.resolved?.mediaId ?? value.assetId ?? null;
                const result = await window.StudioUISDK.variable.setValue(currentVariableId, assetId);
                return result;
            }
            return null;
        },
        [currentVariableId],
    );

    const handleImageRemove = useCallback(async () => {
        if (currentVariableId) {
            const result = await window.StudioUISDK.variable.setValue(currentVariableId, null);
            return result;
        }
        return null;
    }, [currentVariableId]);

    const handleValueChange = useCallback(
        async (value: string | boolean | number) => {
            if (!currentVariableId) return null;
            return window.StudioUISDK.variable.setValue(currentVariableId, value);
        },
        [currentVariableId],
    );

    return {
        handleImageChange,
        handleImageRemove,
        handleValueChange,
    };
};

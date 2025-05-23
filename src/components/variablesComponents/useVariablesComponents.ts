import { ConnectorImageVariableSource, Id } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';
import { useUiConfigContext } from 'src/contexts/UiConfigContext';

export const useVariableComponents = (currentVariableId: Id) => {
    const { projectConfig } = useUiConfigContext();
    const handleImageChange = useCallback(
        async (value: Omit<ConnectorImageVariableSource, 'connectorId' | 'id'>) => {
            if (currentVariableId) {
                const assetId = value.resolved?.mediaId ?? value.assetId ?? null;
                const result = await window.StudioUISDK.variable.setValue(currentVariableId, assetId);
                if (result.success) {
                    projectConfig.onVariableValueChangedCompleted?.(currentVariableId, assetId);
                }
                return result;
            }
            return null;
        },
        [currentVariableId],
    );

    const handleImageRemove = useCallback(async () => {
        if (currentVariableId) {
            const result = await window.StudioUISDK.variable.setValue(currentVariableId, null);
            if (result.success) {
                projectConfig.onVariableValueChangedCompleted?.(currentVariableId, null);
            }
            return result;
        }
        return null;
    }, [currentVariableId]);

    const handleValueChange = useCallback(
        async (value: string | boolean | number) => {
            if (!currentVariableId) return null;
            const result = await window.StudioUISDK.variable.setValue(currentVariableId, value);
            if (result.success) {
                projectConfig.onVariableValueChangedCompleted?.(currentVariableId, value);
            }
            return result;
        },
        [currentVariableId],
    );

    return {
        handleImageChange,
        handleImageRemove,
        handleValueChange,
    };
};

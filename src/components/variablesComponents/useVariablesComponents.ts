import { ConnectorImageVariableSource, Id } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';
import { useUiConfigContext } from 'src/contexts/UiConfigContext';
import { SEARCH_IN_UPLOAD_FOLDER_FIELD_NAME } from 'src/utils/constants';

interface ChangeImageVariableValue {
    id: string;
    value: string | null;
    context: {
        [SEARCH_IN_UPLOAD_FOLDER_FIELD_NAME]: boolean;
    };
}

async function changeImageVariableValue({ id, value, context }: ChangeImageVariableValue) {
    await window.StudioUISDK.undoManager.record('changeImageVariableValue', async (sdk) => {
        await sdk.variable.setImageVariableValueWithContext(id, value, context);
    });
}

export const useVariableComponents = (currentVariableId: Id) => {
    const { projectConfig } = useUiConfigContext();
    const handleImageChange = useCallback(
        async (
            value: Omit<ConnectorImageVariableSource, 'connectorId' | 'id' | 'context'> & {
                context: { searchInUploadFolder: boolean };
            },
        ) => {
            if (currentVariableId) {
                const assetId = value.resolved?.mediaId ?? value.assetId ?? null;
                await changeImageVariableValue({
                    id: currentVariableId,
                    value: assetId,
                    context: value.context,
                });
                projectConfig.onVariableValueChangedCompleted?.(currentVariableId, assetId);
            }
        },
        [currentVariableId, projectConfig],
    );

    const handleImageRemove = useCallback(async () => {
        if (currentVariableId) {
            await changeImageVariableValue({
                id: currentVariableId,
                value: null,
                context: { searchInUploadFolder: false },
            });
            projectConfig.onVariableValueChangedCompleted?.(currentVariableId, null);
        }
    }, [currentVariableId, projectConfig]);

    const handleValueChange = useCallback(
        async (value: string | boolean | number) => {
            if (!currentVariableId) return null;
            const result = await window.StudioUISDK.variable.setValue(currentVariableId, value);
            if (result.success) {
                projectConfig.onVariableValueChangedCompleted?.(currentVariableId, value);
            }
            return result;
        },
        [currentVariableId, projectConfig],
    );

    return {
        handleImageChange,
        handleImageRemove,
        handleValueChange,
    };
};

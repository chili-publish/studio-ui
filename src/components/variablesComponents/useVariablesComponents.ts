import { ConnectorImageVariableSource, Id } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';
import { useSubscriberContext } from '../../contexts/Subscriber';

export const useVariableComponents = (currentVariableId: Id) => {
    const { subscriber } = useSubscriberContext();
    const handleImageChange = useCallback(
        async (value: ConnectorImageVariableSource) => {
            if (currentVariableId) {
                const assetId = value.resolved?.mediaId ?? value.assetId ?? null;
                const result = await window.SDK.variable.setValue(currentVariableId, assetId);
                return result;
            }
            return null;
        },
        [currentVariableId],
    );

    const handleImageRemove = useCallback(async () => {
        if (currentVariableId) {
            const result = await window.SDK.variable.setValue(currentVariableId, null);
            return result;
        }
        return null;
    }, [currentVariableId]);

    // TODO: add number to value types after SDK numbers PR is merged
    const handleValueChange = useCallback(
        async (value: string | boolean) => {
            if (!currentVariableId) return null;
            const res = await window.SDK.variable.setValue(currentVariableId, value);
            subscriber?.emit('onVariableValueChanged', { id: currentVariableId, value });
            return res;
        },
        [currentVariableId, subscriber],
    );

    return {
        handleImageChange,
        handleImageRemove,
        handleValueChange,
    };
};

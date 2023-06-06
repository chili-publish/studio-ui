/* eslint-disable no-console */
import {
    Id,
    ImageVariableSource,
    ImageVariableSourceType,
    MediaConnectorImageVariableSource,
} from '@chili-publish/studio-sdk';

export const useVariableComponents = (currentVariable: Id) => {
    const closePanel = () => {
        console.log('%c⧭', 'color: #ff0000', 'Closing the panel');
    };

    const handleImageChange = async (src: ImageVariableSource) => {
        if (currentVariable) {
            const value =
                src && src.sourceType === ImageVariableSourceType.mediaConnector
                    ? (src as MediaConnectorImageVariableSource).assetId
                    : null;
            const result = await window.SDK.variable.setVariableValue(currentVariable, value);
            return result;
        }
        return null;
    };

    const handleImageRemove = async () => {
        if (currentVariable) {
            const result = await window.SDK.variable.setVariableValue(currentVariable, null);
            return result;
        }
        return null;
    };

    const handleValueChange = (value: string) => {
        console.log('%c⧭', 'color: #aa00ff', 'changing the value of variable ', currentVariable, 'to ', value);
    };

    return {
        handleImageChange,
        handleImageRemove,
        handleValueChange,
        closePanel,
    };
};

/* eslint-disable no-console */
import { Id, ImageVariableSource } from '@chili-publish/studio-sdk';

export const useVariableComponents = (currentVariableId: Id) => {
    const closePanel = () => {
        console.log('%c⧭', 'color: #ff0000', 'Closing the panel');
    };

    const handleImageChange = (source: ImageVariableSource) => {
        console.log('%c⧭', 'color: #00e600', 'changing the image to', source);
    };

    const handleImageRemove = () => {
        console.log('%c⧭', 'color: #00a3cc', 'removing the image', currentVariableId);
    };

    const handleValueChange = async (value: string) => {
        // This is only for testing purposes
        await window.SDK.variable.setVariableValue(currentVariableId, value);
        console.log('%c⧭', 'color: #aa00ff', 'changing the value of variable ', currentVariableId, 'to ', value);
    };

    return {
        handleImageChange,
        handleImageRemove,
        handleValueChange,
        closePanel,
    };
};

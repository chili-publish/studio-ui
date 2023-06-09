/* eslint-disable no-console */
import { Id, ImageVariableSource } from '@chili-publish/studio-sdk';

export const useVariableComponents = (currentVariable: Id) => {
    const closePanel = () => {
        console.log('%c⧭', 'color: #ff0000', 'Closing the panel');
    };

    const handleImageChange = async (src: ImageVariableSource) => {
        if (currentVariable) {
            const result = await window.SDK.variable.setVariableSource(currentVariable, src);
            return result;
        }
        return null;
    };

    const handleImageRemove = async () => {
        if (currentVariable) {
            const result = await window.SDK.variable.removeVariableSource(currentVariable);
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

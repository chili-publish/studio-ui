import { MeasurementUnit, EditorResponse } from '@chili-publish/studio-sdk';

export const formatNumber = (value: number | string, measurementUnit?: MeasurementUnit): string => {
    if (value === undefined) return 'undefined';

    let newValue;
    if (typeof value === 'number') {
        newValue = value;
    } else {
        newValue = +value.replace(measurementUnit ?? '', '');
    }
    return newValue % 1 ? newValue.toFixed(2) : newValue.toString();
};

export const handleSetProperty = async (
    sdkMethod: () => Promise<EditorResponse<null> | null>,
    localStateUpdater: () => void,
) => {
    try {
        await sdkMethod();
    } catch (error) {
        localStateUpdater();
        // eslint-disable-next-line no-console
        console.error('SDK set properties error:', error);
    }
};

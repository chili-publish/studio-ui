import { MeasurementUnit, EditorResponse } from '@chili-publish/studio-sdk';
import { getPrecisionForUnit } from './precisionConfig';

export const formatNumber = (value: number | string, measurementUnit?: MeasurementUnit): string => {
    if (!value) return 'undefined';

    let newValue;
    if (typeof value === 'number') {
        newValue = value;
    } else {
        newValue = +value.replace(measurementUnit ?? '', '');
    }
    const precision = getPrecisionForUnit(measurementUnit);
    return newValue % 1 ? String(+newValue.toFixed(precision)) : newValue.toString();
};

export const handleSetProperty = async (
    sdkMethod: () => Promise<EditorResponse<null> | null>,
    localStateUpdater: () => Promise<void>,
) => {
    try {
        await sdkMethod();
    } catch (error) {
        await localStateUpdater();
        // eslint-disable-next-line no-console
        console.error('SDK set properties error:', error);
    }
};

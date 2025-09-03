import { MeasurementUnit } from '@chili-publish/studio-sdk';
import { formatNumber } from 'src/utils/formatNumber';

export const normalizeValue = (value: number | null | undefined): number | null => {
    return value ?? null;
};

export const compareValues = (a: number | null | undefined, b: number | null | undefined): boolean => {
    const normalizedA = normalizeValue(a);
    const normalizedB = normalizeValue(b);
    return normalizedA === normalizedB;
};

export const withMeasurementUnit = (value: number | string, measurementUnit?: MeasurementUnit): string => {
    let formattedValue = formatNumber(value, measurementUnit);
    formattedValue = formattedValue === 'undefined' ? '0' : formattedValue;
    return `${formattedValue} ${measurementUnit}`;
};

export const roundValue = (value: number, decimals: number = 2): string => {
    return (Math.round(value * 10 ** decimals) / 10 ** decimals).toString();
};

export const clampValue = (value: number | null, min?: number | null, max?: number | null) => {
    const normalizedValue = value ?? 0;
    const minValue = normalizeValue(min);
    const maxValue = normalizeValue(max);

    if (minValue === null && maxValue === null) {
        return value;
    }

    if (minValue !== null && maxValue === null && normalizedValue < minValue) {
        return minValue;
    }

    if (minValue === null && maxValue !== null && normalizedValue > maxValue) {
        return maxValue;
    }

    if (minValue !== null && maxValue !== null && normalizedValue < minValue) {
        return minValue;
    }

    if (minValue !== null && maxValue !== null && normalizedValue > maxValue) {
        return maxValue;
    }

    return value;
};

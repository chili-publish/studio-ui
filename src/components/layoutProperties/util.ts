import { MeasurementUnit } from '@chili-publish/studio-sdk';
import { formatNumber } from 'src/utils/formatNumber';
import { getMeasurementUnits } from 'src/utils/precisionConfig';

export const normalizeValue = (value: number | null | undefined): number | null => {
    return value ?? null;
};

export const compareValues = (a: number | null | undefined, b: number | null | undefined): boolean => {
    const normalizedA = normalizeValue(a);
    const normalizedB = normalizeValue(b);
    return normalizedA === normalizedB;
};

export const withMeasurementUnit = (value: number | string, measurementUnit?: MeasurementUnit): string => {
    return `${formatNumber(value, measurementUnit)} ${measurementUnit}`;
};

export const roundValue = (value: number, decimals: number = 2): string => {
    return (Math.round(value * 10 ** decimals) / 10 ** decimals).toString();
};

export const getInputValueAndUnit = (value: string, defaultUnit?: MeasurementUnit) => {
    const measurementUnits = getMeasurementUnits();
    const unit = measurementUnits.find((unitValue) => value.endsWith(unitValue)) || defaultUnit;
    const cleanedValue = value.replace(new RegExp(`\\s*${unit}\\s*`, 'gi'), '');

    return { unit, value: Number(formatNumber(cleanedValue, unit as MeasurementUnit)) || 0 };
};

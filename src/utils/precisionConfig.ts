import { MeasurementUnit } from '@chili-publish/studio-sdk';

export const UNIT_PRECISIONS: Record<string, number> = {
    [MeasurementUnit.px]: 2,
    [MeasurementUnit.cm]: 2,
    [MeasurementUnit.mm]: 2,
    [MeasurementUnit.inch]: 4,
    [MeasurementUnit.pt]: 2,
};

// the default precision will be 2 if not precised f.e for Magnification % or Rotation degrees...
export const getPrecisionForUnit = (unit?: MeasurementUnit): number => {
    return unit ? UNIT_PRECISIONS[unit === ('in' as MeasurementUnit) ? MeasurementUnit.inch : unit] ?? 2 : 2;
};

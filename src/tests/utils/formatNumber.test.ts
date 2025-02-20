import { MeasurementUnit } from '@chili-publish/studio-sdk';
import { formatNumber } from '../../utils/formatNumber';

describe('formatNumber', () => {
    it('should format floating numbers to 2 deciamls, integers to 0 decimals and remove " px" from the end of strings', () => {
        expect(formatNumber(12.1234)).toBe('12.12');
        expect(formatNumber('12.1234 px', MeasurementUnit.px)).toBe('12.12');
        expect(formatNumber('12.129331 px', MeasurementUnit.px)).toBe('12.13');
        expect(formatNumber('25.000006 px', MeasurementUnit.px)).toBe('25');
        expect(formatNumber('30.0995 px', MeasurementUnit.px)).toBe('30.1');
        expect(formatNumber('30.0994 px', MeasurementUnit.px)).toBe('30.1');
        expect(formatNumber('30.0889 px', MeasurementUnit.px)).toBe('30.09');
        expect(formatNumber(12.129331)).toBe('12.13');
    });
});

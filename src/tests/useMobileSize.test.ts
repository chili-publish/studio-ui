import { renderHook } from '@testing-library/react';
import useMobileSize from '../hooks/useMobileSize';

describe('useMobileSize', () => {
    it('should return `false` for desktop width', async () => {
        global.innerWidth = 1024;
        const { result } = renderHook(() => useMobileSize());
        expect(result.current).toEqual(false);
    });
    it('should return `true` for mobile width', async () => {
        global.innerWidth = 500;
        const { result } = renderHook(() => useMobileSize());
        expect(result.current).toEqual(true);
    });
});

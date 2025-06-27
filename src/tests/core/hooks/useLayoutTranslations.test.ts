import { renderHookWithProviders } from '@tests/mocks/Provider';
import { useLayoutTranslations } from '../../../core/hooks/useLayoutTranslations';
import { LayoutTranslations } from '../../../types/LayoutTranslations';

describe('useLayoutTranslations (hook only)', () => {
    const mockTranslations: LayoutTranslations = {
        'L1 display name': { displayName: 'Translated L1' },
        L2: { displayName: 'Translated L2' },
        'L3 display name': { displayName: 'Translated by DisplayName' },
        L3: { displayName: 'Translated by Name' },
    };

    const layoutWithDisplayName = { name: 'L1', displayName: 'L1 display name' };
    const layoutWithNameOnly = { name: 'L2', displayName: null };
    const layoutWithBoth = { name: 'L3', displayName: 'L3 display name' };
    const layoutWithNoTranslation = { name: 'L4', displayName: 'L4 display name' };
    const layoutWithDisplayNameNull = { name: 'L5', displayName: null };
    const layoutWithDisplayNameUndefined = { name: 'L6', displayName: undefined };
    const layoutWithDisplayNameEmpty = { name: 'L7', displayName: '' };

    it('should return original displayName if no translation exists', () => {
        const { result } = renderHookWithProviders(() => useLayoutTranslations(), {
            preloadedState: {
                appConfig: {
                    layoutTranslations: {},
                },
            },
        });
        expect(result.current.getTranslatedLayoutDisplayName(layoutWithDisplayName)).toBe('L1 display name');
    });

    it('should return translated displayName when displayName key exists', () => {
        const { result } = renderHookWithProviders(() => useLayoutTranslations(), {
            preloadedState: {
                appConfig: {
                    layoutTranslations: mockTranslations,
                },
            },
        });
        expect(result.current.getTranslatedLayoutDisplayName(layoutWithDisplayName)).toBe('Translated L1');
    });

    it('should return translated displayName when only name key exists', () => {
        const { result } = renderHookWithProviders(() => useLayoutTranslations(), {
            preloadedState: {
                appConfig: {
                    layoutTranslations: mockTranslations,
                },
            },
        });
        expect(result.current.getTranslatedLayoutDisplayName(layoutWithNameOnly)).toBe('Translated L2');
    });

    it('should prefer displayName key over name key if both exist', () => {
        const { result } = renderHookWithProviders(() => useLayoutTranslations(), {
            preloadedState: {
                appConfig: {
                    layoutTranslations: mockTranslations,
                },
            },
        });
        expect(result.current.getTranslatedLayoutDisplayName(layoutWithBoth)).toBe('Translated by DisplayName');
    });

    it('should fall back to name if displayName is null', () => {
        const { result } = renderHookWithProviders(() => useLayoutTranslations(), {
            preloadedState: {
                appConfig: {
                    layoutTranslations: mockTranslations,
                },
            },
        });
        expect(result.current.getTranslatedLayoutDisplayName(layoutWithDisplayNameNull)).toBe('L5');
    });

    it('should fall back to name if displayName is undefined', () => {
        const { result } = renderHookWithProviders(() => useLayoutTranslations(), {
            preloadedState: {
                appConfig: {
                    layoutTranslations: mockTranslations,
                },
            },
        });
        expect(result.current.getTranslatedLayoutDisplayName(layoutWithDisplayNameUndefined)).toBe('L6');
    });

    it('should fall back to name if displayName is empty string', () => {
        const { result } = renderHookWithProviders(() => useLayoutTranslations(), {
            preloadedState: {
                appConfig: {
                    layoutTranslations: mockTranslations,
                },
            },
        });
        expect(result.current.getTranslatedLayoutDisplayName(layoutWithDisplayNameEmpty)).toBe('L7');
    });

    it('should return original displayName if no translation is found and displayName exists', () => {
        const { result } = renderHookWithProviders(() => useLayoutTranslations(), {
            preloadedState: {
                appConfig: {
                    layoutTranslations: mockTranslations,
                },
            },
        });
        expect(result.current.getTranslatedLayoutDisplayName(layoutWithNoTranslation)).toBe('L4 display name');
    });

    it('should return name if no translation is found and displayName is null', () => {
        const { result } = renderHookWithProviders(() => useLayoutTranslations(), {
            preloadedState: {
                appConfig: {
                    layoutTranslations: mockTranslations,
                },
            },
        });
        expect(result.current.getTranslatedLayoutDisplayName({ name: 'L8', displayName: null })).toBe('L8');
    });
});

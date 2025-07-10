import { renderHookWithProviders } from '@tests/mocks/Provider';
import { useUITranslations } from '../../../core/hooks/useUITranslations';

describe('useUITranslations', () => {
    const mockUITranslations = {
        formBuilder: {
            layouts: {
                header: 'Layouts translated',
            },
        },
        modals: {
            connectorAuthorization: {
                description: '{{name}} needs to be authorized translated',
            },
        },
        toast: {
            connectorAuthorization: {
                error: "Authorization failed for '{{connectorName}}' connector translated",
                timeoutError: "Authorization failed (timeout) for '{{connectorName}}' connector translated",
            },
        },
        panels: {
            media: {
                title: 'Select Image translated',
                searchPlaceholder: 'Search translated',
                noSearchResults: 'No search results found translated',
            },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // Test 1: Non-existing path
    it('should return fallback when translation path does not exist', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(result.current.getUITranslation(['nonExistent', 'path'] as any, 'fallback value')).toBe(
            'fallback value',
        );
    });

    // Test 2: Existing path with no translation (with and without replacement)
    it('should return fallback when translation exists but value is not provided', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: {} } },
        });
        expect(result.current.getUITranslation(['formBuilder', 'layouts', 'header'], 'fallback value')).toBe(
            'fallback value',
        );
    });

    it('should return fallback with replacements when translation exists but value is not provided', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: {} } },
        });
        const translation = result.current.getUITranslation(
            ['modals', 'connectorAuthorization', 'description'],
            'Hello {{name}}',
            { name: 'World' },
        );
        expect(translation).toBe('Hello World');
    });

    // Test 3: Existing path with translation
    it('should return correct translation for existing path', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation(['formBuilder', 'layouts', 'header'], 'fallback')).toBe(
            'Layouts translated',
        );
    });

    // Test 4: All translation keys that support dynamic parts
    it('should replace {{name}} placeholder in translation', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        const translation = result.current.getUITranslation(
            ['modals', 'connectorAuthorization', 'description'],
            '{{name}} needs to be authorized',
            { name: 'TestConnector' },
        );
        expect(translation).toBe('TestConnector needs to be authorized translated');
    });

    it('should replace {{connectorName}} placeholder in translation', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        const translation = result.current.getUITranslation(
            ['toast', 'connectorAuthorization', 'error'],
            "Authorization failed for '{{connectorName}}' connector",
            { connectorName: 'TestConnector' },
        );
        expect(translation).toBe("Authorization failed for 'TestConnector' connector translated");
    });

    it('should handle multiple placeholders in translation', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        const translation = result.current.getUITranslation(
            ['toast', 'connectorAuthorization', 'timeoutError'],
            "Authorization failed (timeout) for '{{connectorName}}' connector",
            { connectorName: 'TestConnector' },
        );
        expect(translation).toBe("Authorization failed (timeout) for 'TestConnector' connector translated");
    });

    it('should handle empty replacements object', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        const translation = result.current.getUITranslation(
            ['modals', 'connectorAuthorization', 'description'],
            '{{name}} needs to be authorized',
            {},
        );
        expect(translation).toBe('{{name}} needs to be authorized translated');
    });
});

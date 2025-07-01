import { renderHookWithProviders } from '@tests/mocks/Provider';
import { useUITranslations } from '../../../core/hooks/useUITranslations';

describe('useUITranslations', () => {
    const mockUITranslations = {
        formBuilder: {
            variables: { header: 'Vars', helpText: 'Vars help' },
            datasource: { header: 'DS', helpText: 'DS help', row: 'Row', inputLabel: 'Data row' },
            layouts: {
                header: 'Layouts translated',
                helpText: 'Layouts help translated',
                inputLabel: 'Select layout translated',
                width: 'Width translated',
                height: 'Height translated',
            },
        },
        toolBar: {
            downloadButton: {
                label: 'Download translated',
                outputSelector: { label: 'Output translated' },
            },
        },
    };

    it('should return undefined for missing translation', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(result.current.getUITranslation('formBuilder', 'variables', 'nonexistent' as any)).toBeUndefined();
    });

    it('should return correct translation for formBuilder.layouts.header', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('formBuilder', 'layouts', 'header')).toBe('Layouts translated');
    });
    it('should return correct translation for formBuilder.layouts.helpText', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('formBuilder', 'layouts', 'helpText')).toBe('Layouts help translated');
    });
    it('should return correct translation for formBuilder.layouts.inputLabel', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('formBuilder', 'layouts', 'inputLabel')).toBe(
            'Select layout translated',
        );
    });
    it('should return correct translation for formBuilder.layouts.width', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('formBuilder', 'layouts', 'width')).toBe('Width translated');
    });
    it('should return correct translation for formBuilder.layouts.height', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('formBuilder', 'layouts', 'height')).toBe('Height translated');
    });
    it('should return correct translation for formBuilder.datasource.header', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('formBuilder', 'datasource', 'header')).toBe('DS');
    });
    it('should return correct translation for formBuilder.datasource.helpText', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('formBuilder', 'datasource', 'helpText')).toBe('DS help');
    });
    it('should return correct translation for formBuilder.datasource.row', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('formBuilder', 'datasource', 'row')).toBe('Row');
    });
    it('should return correct translation for formBuilder.datasource.inputLabel', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('formBuilder', 'datasource', 'inputLabel')).toBe('Data row');
    });

    it('should return correct translation for formBuilder.variables.header', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('formBuilder', 'variables', 'header')).toBe('Vars');
    });

    it('should return correct translation for toolBar.downloadButton.label', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('toolBar', 'downloadButton', 'label')).toBe('Download translated');
    });

    it('should return correct translation for toolBar.downloadButton.outputSelector.label', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('toolBar', 'downloadButton', 'outputSelector', 'label')).toBe(
            'Output translated',
        );
    });
});

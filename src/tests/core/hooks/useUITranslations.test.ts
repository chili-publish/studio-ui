import { renderHookWithProviders } from '@tests/mocks/Provider';
import { useUITranslations } from '../../../core/hooks/useUITranslations';

describe('useUITranslations', () => {
    const mockUITranslations = {
        formBuilder: {
            variables: { header: 'Vars', helpText: 'Vars help' },
            datasource: { header: 'DS', helpText: 'DS help', row: 'Row', inputLabel: 'Data row' },
            layouts: {
                header: 'Layouts',
                helpText: 'Layouts help',
                inputLabel: 'Select layout',
                width: 'Width',
                height: 'Height',
            },
        },
        toolBar: {
            downloadButton: {
                label: 'Download',
                outputSelector: { label: 'Output' },
            },
        },
    };

    it('should return correct translation for formBuilder.variables.header', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('formBuilder', 'variables', 'header')).toBe('Vars');
    });

    it('should return undefined for missing translation', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('formBuilder', 'variables', 'nonexistent')).toBeUndefined();
    });

    it('should return correct translation for toolBar.downloadButton.label', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('toolBar', 'downloadButton', 'label')).toBe('Download');
    });

    it('should return correct translation for toolBar.downloadButton.outputSelector.label', () => {
        const { result } = renderHookWithProviders(() => useUITranslations(), {
            preloadedState: { appConfig: { uiTranslations: mockUITranslations } },
        });
        expect(result.current.getUITranslation('toolBar', 'downloadButton', 'outputSelector', 'label')).toBe('Output');
    });
});

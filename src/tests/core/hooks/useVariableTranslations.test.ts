import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';
import { variables as mockVariables } from '@tests/mocks/mockVariables';
import { renderHookWithProviders } from '@tests/mocks/Provider';
import { useVariableTranslations } from '../../../core/hooks/useVariableTranslations';
import { VariableTranslations } from '../../../types/VariableTranslations';

describe('useVariableTranslations', () => {
    const mockTranslations: VariableTranslations = {
        'Short Variable 1': {
            label: 'Translated Short Text',
            placeholder: 'Enter translated text',
            helpText: 'This is translated help text',
        },
        'Date Variable 1 Label': {
            label: 'Translated Date',
            placeholder: 'Select translated date',
            helpText: 'This is translated date help',
        },
        'List label': {
            label: 'Translated List',
            placeholder: 'Select translated option',
            helpText: 'This is translated list help',
            listItems: {
                'Val 1': 'Translated Val 1',
            },
        },
    };

    beforeEach(() => {
        // Reset the mock before each test
        jest.clearAllMocks();
    });

    it('should return original variable when no translation exists', () => {
        const variable = mockVariables[2]; // ShortTextVariable with label
        const { result } = renderHookWithProviders(() => useVariableTranslations(), {
            preloadedState: {
                appConfig: {
                    variableTranslations: {},
                },
            },
        });
        const updatedVariable = result.current.updateWithTranslation(variable);

        expect(updatedVariable).toEqual(variable);
    });

    it('should update variable with translations when they exist', () => {
        const variable = mockVariables[2]; // ShortTextVariable with label
        const { result } = renderHookWithProviders(() => useVariableTranslations(), {
            preloadedState: {
                appConfig: {
                    variableTranslations: mockTranslations,
                },
            },
        });
        const updatedVariable = result.current.updateWithTranslation(variable);

        expect(updatedVariable).toEqual({
            ...variable,
            label: 'Translated Short Text',
            placeholder: 'Enter translated text',
            helpText: 'This is translated help text',
        });
    });

    it('should handle partial translations', () => {
        const variable = mockVariables[6]; // DateVariable
        const { result } = renderHookWithProviders(() => useVariableTranslations(), {
            preloadedState: {
                appConfig: {
                    variableTranslations: {
                        'Date Variable 1 Label': {
                            label: 'Translated Date',
                            helpText: 'This is translated date help',
                            // placeholder is undefined
                        },
                    },
                },
            },
        });
        const updatedVariable = result.current.updateWithTranslation(variable);

        expect(updatedVariable).toEqual({
            ...variable,
            label: 'Translated Date',
            placeholder: variable.placeholder, // Original value preserved
            helpText: 'This is translated date help',
        });
    });

    it('should handle variables without labels', () => {
        const variable = mockVariables[9]; // ShortTextVariable without label
        const { result } = renderHookWithProviders(() => useVariableTranslations(), {
            preloadedState: {
                appConfig: {
                    variableTranslations: mockTranslations,
                },
            },
        });
        const updatedVariable = result.current.updateWithTranslation(variable);

        expect(updatedVariable).toEqual(variable); // Should remain unchanged as there's no label to match translations
    });

    it('should translate list variable items when translations exist', () => {
        const listVariable = mockVariables.find((v) => v.label === 'List label') as ListVariable;
        if (!listVariable || !('items' in listVariable)) {
            throw new Error('List variable not found in mock variables');
        }

        const { result } = renderHookWithProviders(() => useVariableTranslations(), {
            preloadedState: {
                appConfig: {
                    variableTranslations: mockTranslations,
                },
            },
        });
        const updatedVariable = result.current.updateWithTranslation(listVariable);

        expect(updatedVariable).toEqual({
            ...listVariable,
            label: 'Translated List',
            placeholder: 'Select translated option',
            helpText: 'This is translated list help',
            items: [{ value: 'val 1', displayValue: 'Translated Val 1' }, { value: 'val 2' }],
        });
    });

    it('should preserve original list item values when no translation exists', () => {
        const listVariable = mockVariables.find((v) => v.label === 'List label') as ListVariable;
        if (!listVariable || !('items' in listVariable)) {
            throw new Error('List variable not found in mock variables');
        }

        const { result } = renderHookWithProviders(() => useVariableTranslations(), {
            preloadedState: {
                appConfig: {
                    variableTranslations: {
                        'List label': {
                            label: 'Translated List',
                            placeholder: 'Select translated option',
                            helpText: 'This is translated list help',
                            // listItems is undefined
                        },
                    },
                },
            },
        });
        const updatedVariable = result.current.updateWithTranslation(listVariable);

        expect(updatedVariable).toEqual({
            ...listVariable,
            label: 'Translated List',
            placeholder: 'Select translated option',
            helpText: 'This is translated list help',
            items: listVariable.items, // Original items preserved
        });
    });
});

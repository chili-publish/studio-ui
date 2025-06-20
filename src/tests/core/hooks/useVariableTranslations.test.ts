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

    it('should translate selected list item displayValue when translation exists', () => {
        // Clone the list variable and add a selected property
        const listVariable = {
            ...mockVariables.find((v) => v.label === 'List label'),
            selected: { value: 'val 1', displayValue: 'Val 1' },
        } as ListVariable;

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
            selected: { value: 'val 1', displayValue: 'Translated Val 1' },
        });
    });

    it('should preserve original selected displayValue when no translation exists', () => {
        // Clone the list variable and add a selected property
        const listVariable = {
            ...mockVariables.find((v) => v.label === 'List label'),
            selected: { value: 'val 2', displayValue: 'Val 2' },
        } as ListVariable;

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
            selected: { value: 'val 2', displayValue: 'Val 2' },
        });
    });

    it('should use variable name for translation if label translation is missing', () => {
        // variable with label and name, but only name is present in translations
        const variable = { ...mockVariables[2], label: 'Nonexistent Label', name: 'Short Variable 1' };
        const { result } = renderHookWithProviders(() => useVariableTranslations(), {
            preloadedState: {
                appConfig: {
                    variableTranslations: {
                        'Short Variable 1': {
                            label: 'Translated by Name',
                            placeholder: 'Name placeholder',
                            helpText: 'Name help',
                        },
                    },
                },
            },
        });
        const updatedVariable = result.current.updateWithTranslation(variable);
        expect(updatedVariable).toEqual({
            ...variable,
            label: 'Translated by Name',
            placeholder: 'Name placeholder',
            helpText: 'Name help',
        });
    });

    it('should prefer label translation over name translation if both exist', () => {
        // variable with label and name, both present in translations
        const variable = { ...mockVariables[2], label: 'Short Variable 1 Label', name: 'Short Variable 1' };
        const { result } = renderHookWithProviders(() => useVariableTranslations(), {
            preloadedState: {
                appConfig: {
                    variableTranslations: {
                        'Short Variable 1 Label': {
                            label: 'Translated by Label',
                            placeholder: 'Label placeholder',
                            helpText: 'Label help',
                        },
                        'Short Variable 1': {
                            label: 'Translated by Name',
                            placeholder: 'Name placeholder',
                            helpText: 'Name help',
                        },
                    },
                },
            },
        });
        const updatedVariable = result.current.updateWithTranslation(variable);
        expect(updatedVariable).toEqual({
            ...variable,
            label: 'Translated by Label',
            placeholder: 'Label placeholder',
            helpText: 'Label help',
        });
    });

    it('should use variable name for translation if label is undefined', () => {
        // variable with label undefined, but name present in translations
        const variable = { ...mockVariables[9], label: undefined, name: 'Short Var name' };
        const { result } = renderHookWithProviders(() => useVariableTranslations(), {
            preloadedState: {
                appConfig: {
                    variableTranslations: {
                        'Short Var name': {
                            label: 'Translated by Name',
                            placeholder: 'Name placeholder',
                            helpText: 'Name help',
                        },
                    },
                },
            },
        });
        const updatedVariable = result.current.updateWithTranslation(variable);
        expect(updatedVariable).toEqual({
            ...variable,
            label: 'Translated by Name',
            placeholder: 'Name placeholder',
            helpText: 'Name help',
        });
    });

    it('should use variable name for translation if label is empty', () => {
        // variable with label empty, but name present in translations
        const variable = { ...mockVariables[9], label: '', name: 'Short Var name' };
        const { result } = renderHookWithProviders(() => useVariableTranslations(), {
            preloadedState: {
                appConfig: {
                    variableTranslations: {
                        'Short Var name': {
                            label: 'Translated by Name',
                            placeholder: 'Name placeholder',
                            helpText: 'Name help',
                        },
                    },
                },
            },
        });
        const updatedVariable = result.current.updateWithTranslation(variable);
        expect(updatedVariable).toEqual({
            ...variable,
            label: 'Translated by Name',
            placeholder: 'Name placeholder',
            helpText: 'Name help',
        });
    });
});

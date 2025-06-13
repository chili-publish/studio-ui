import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';
import { renderHook } from '@testing-library/react';
import { variables as mockVariables } from '@tests/mocks/mockVariables';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { useVariableTranslations } from '../../../core/hooks/useVariableTranslations';
import { VariableTranslations } from '../../../types/VariableTranslations';

// Mock the VariablePanelContext
jest.mock('../../../contexts/VariablePanelContext', () => ({
    useVariablePanelContext: jest.fn(),
}));

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
        // Mock the context to return empty translations
        (useVariablePanelContext as jest.Mock).mockReturnValue({ variableTranslations: {} });

        const variable = mockVariables[2]; // ShortTextVariable with label
        const { result } = renderHook(() => useVariableTranslations());
        const updatedVariable = result.current.updateWithTranslation(variable);

        expect(updatedVariable).toEqual(variable);
    });

    it('should update variable with translations when they exist', () => {
        // Mock the context to return our translations
        (useVariablePanelContext as jest.Mock).mockReturnValue({ variableTranslations: mockTranslations });

        const variable = mockVariables[2]; // ShortTextVariable with label
        const { result } = renderHook(() => useVariableTranslations());
        const updatedVariable = result.current.updateWithTranslation(variable);

        expect(updatedVariable).toEqual({
            ...variable,
            label: 'Translated Short Text',
            placeholder: 'Enter translated text',
            helpText: 'This is translated help text',
        });
    });

    it('should handle partial translations', () => {
        // Mock the context to return translations with some fields
        (useVariablePanelContext as jest.Mock).mockReturnValue({
            variableTranslations: {
                'Date Variable 1 Label': {
                    label: 'Translated Date',
                    helpText: 'This is translated date help',
                    // placeholder is undefined
                },
            },
        });

        const variable = mockVariables[6]; // DateVariable
        const { result } = renderHook(() => useVariableTranslations());
        const updatedVariable = result.current.updateWithTranslation(variable);

        expect(updatedVariable).toEqual({
            ...variable,
            label: 'Translated Date',
            placeholder: variable.placeholder, // Original value preserved
            helpText: 'This is translated date help',
        });
    });

    it('should handle variables without labels', () => {
        // Mock the context to return translations
        (useVariablePanelContext as jest.Mock).mockReturnValue({ variableTranslations: mockTranslations });

        const variable = mockVariables[9]; // ShortTextVariable without label
        const { result } = renderHook(() => useVariableTranslations());
        const updatedVariable = result.current.updateWithTranslation(variable);

        expect(updatedVariable).toEqual(variable); // Should remain unchanged as there's no label to match translations
    });

    it('should translate list variable items when translations exist', () => {
        // Mock the context to return our translations
        (useVariablePanelContext as jest.Mock).mockReturnValue({ variableTranslations: mockTranslations });

        const listVariable = mockVariables.find((v) => v.label === 'List label') as ListVariable;
        if (!listVariable || !('items' in listVariable)) {
            throw new Error('List variable not found in mock variables');
        }

        const { result } = renderHook(() => useVariableTranslations());
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
        // Mock the context to return translations without list items
        (useVariablePanelContext as jest.Mock).mockReturnValue({
            variableTranslations: {
                'List label': {
                    label: 'Translated List',
                    placeholder: 'Select translated option',
                    helpText: 'This is translated list help',
                    // listItems is undefined
                },
            },
        });

        const listVariable = mockVariables.find((v) => v.label === 'List label') as ListVariable;
        if (!listVariable || !('items' in listVariable)) {
            throw new Error('List variable not found in mock variables');
        }

        const { result } = renderHook(() => useVariableTranslations());
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

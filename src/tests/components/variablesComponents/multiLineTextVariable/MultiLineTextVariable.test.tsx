import { getDataTestId, UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { LongTextVariable, ShortTextVariable } from '@chili-publish/studio-sdk';
import { render, screen } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import MultiLineTextVariable from '../../../../components/variablesComponents/MultiLineTextVariable';

describe('MultiLineTextVariable', () => {
    const multiLineVariableId = 'multi-line-text-variable-1';

    it('should display the configured placeholder', () => {
        const PLACEHOLDER = 'multi-line placeholder';
        const variable = variables.find((item) => item.id === multiLineVariableId);
        const multiLineVariable = { ...variable, placeholder: PLACEHOLDER } as LongTextVariable;
        render(
            <UiThemeProvider theme="platform">
                <MultiLineTextVariable variable={multiLineVariable} onValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();
    });

    it('should display label as variable label if label exist and empty', () => {
        const variable = variables.find((item) => item.id === multiLineVariableId);
        const multiLineVariable = { ...variable, label: '' } as LongTextVariable;
        render(
            <UiThemeProvider theme="platform">
                <MultiLineTextVariable variable={multiLineVariable} onValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(multiLineVariable.label);
    });

    it('should display label as variable label', () => {
        const variable = variables.find((item) => item.id === multiLineVariableId);
        const multiLineVariable = { ...variable } as LongTextVariable;
        render(
            <UiThemeProvider theme="platform">
                <MultiLineTextVariable variable={multiLineVariable} onValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(multiLineVariable.label);
    });

    it('should display name as variable label if label does not exist', () => {
        const variable = variables.find((item) => item.id === multiLineVariableId);
        const multiLineVariable = { ...variable } as LongTextVariable;
        delete (multiLineVariable as unknown as { [key: string]: string }).label;

        render(
            <UiThemeProvider theme="platform">
                <MultiLineTextVariable variable={multiLineVariable} onValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(multiLineVariable.name);
    });

    it('should show character limit text in the DOM when maxCharacters is set', () => {
        const MAX_CHARACTERS = 140;
        const variable = variables.find((item) => item.id === multiLineVariableId);
        const multiLineVariable = {
            ...variable,
            value: '',
            maxCharacters: MAX_CHARACTERS,
        } as ShortTextVariable;
        render(
            <UiThemeProvider theme="platform">
                <MultiLineTextVariable variable={multiLineVariable} onValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByText(String(MAX_CHARACTERS))).toBeInTheDocument();
    });
});

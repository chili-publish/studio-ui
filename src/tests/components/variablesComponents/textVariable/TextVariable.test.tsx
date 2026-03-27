import { getDataTestId, UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { ShortTextVariable } from '@chili-publish/studio-sdk';
import { render, screen } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import TextVariable from '../../../../components/variablesComponents/TextVariable';

const SHORT_TEXT_VARIABLE_ID = 'shortVariable 1';

describe('TextVariable', () => {
    it('should display the configured placeholder', () => {
        const PLACEHOLDER = 'placeholder text';
        const variable = variables.find((item) => item.id === SHORT_TEXT_VARIABLE_ID);
        const textVariable = { ...variable, placeholder: PLACEHOLDER } as ShortTextVariable;
        render(
            <UiThemeProvider theme="platform">
                <TextVariable variable={textVariable} onValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();
    });

    it('should display label as variable label if label exist and empty', () => {
        const variable = variables.find((item) => item.id === SHORT_TEXT_VARIABLE_ID);
        const textVariable = { ...variable, label: '' } as ShortTextVariable;
        render(
            <UiThemeProvider theme="platform">
                <TextVariable variable={textVariable} onValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(textVariable.label);
    });

    it('should display label as variable label', () => {
        const variable = variables.find((item) => item.id === SHORT_TEXT_VARIABLE_ID);
        const textVariable = { ...variable } as ShortTextVariable;
        render(
            <UiThemeProvider theme="platform">
                <TextVariable variable={textVariable} onValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(textVariable.label);
    });

    it('should display name as variable label if label does not exist', () => {
        const variable = variables.find((item) => item.id === SHORT_TEXT_VARIABLE_ID);
        const textVariable = { ...variable } as ShortTextVariable;
        delete (textVariable as unknown as { [key: string]: string }).label;

        render(
            <UiThemeProvider theme="platform">
                <TextVariable variable={textVariable} onValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(textVariable.name);
    });

    it('should pass maxCharacters to input as maxLength and show character limit in the DOM', () => {
        const MAX_CHARACTERS = 140;
        const variable = variables.find((item) => item.id === SHORT_TEXT_VARIABLE_ID);
        const textVariable = { ...variable, value: '', maxCharacters: MAX_CHARACTERS } as ShortTextVariable;
        render(
            <UiThemeProvider theme="platform">
                <TextVariable variable={textVariable} onValueChange={jest.fn()} />
            </UiThemeProvider>,
        );

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('maxlength', String(MAX_CHARACTERS));
        expect(screen.getByText(String(MAX_CHARACTERS))).toBeInTheDocument();
    });
});

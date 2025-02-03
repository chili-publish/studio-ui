import { getDataTestId, UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { LongTextVariable } from '@chili-publish/studio-sdk';
import { render, screen } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import TextVariable from '../../../../components/variablesComponents/TextVariable';

describe('TextVariable', () => {
    it('should display the configured placeholder', () => {
        const PLACEHOLDER = 'placeholder text';
        const variable = variables.find((item) => item.id === 'longVariable1');
        const textVariable = { ...variable, placeholder: PLACEHOLDER } as LongTextVariable;
        render(
            <UiThemeProvider theme="platform">
                <TextVariable variable={textVariable} onValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();
    });

    it('should display label as variable label if label exist and empty', () => {
        const variable = variables.find((item) => item.id === 'longVariable1');
        const textVariable = { ...variable, label: '' } as LongTextVariable;
        render(
            <UiThemeProvider theme="platform">
                <TextVariable variable={textVariable} onValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(textVariable.label);
    });

    it('should display label as variable label', () => {
        const variable = variables.find((item) => item.id === 'longVariable1');
        const textVariable = { ...variable } as LongTextVariable;
        render(
            <UiThemeProvider theme="platform">
                <TextVariable variable={textVariable} onValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(textVariable.label);
    });

    it('should display name as variable label if label does not exist', () => {
        const variable = variables.find((item) => item.id === 'longVariable1');
        const textVariable = { ...variable } as LongTextVariable;
        delete (textVariable as unknown as { [key: string]: string }).label;

        render(
            <UiThemeProvider theme="platform">
                <TextVariable variable={textVariable} onValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(textVariable.name);
    });
});

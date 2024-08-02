import { DateVariable as DateVariableType } from '@chili-publish/studio-sdk';
import { render, screen } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import DateVariable from '../../../../components/variablesComponents/DateVariable';

describe('DateVariable', () => {
    it('should display the configured placeholder', () => {
        const PLACEHOLDER = 'placeholder text';
        const variable = variables.find((item) => item.id === 'date-variable');
        const dateVariable = { ...variable, placeholder: PLACEHOLDER } as DateVariableType;
        render(
            <UiThemeProvider theme="platform">
                <DateVariable variable={dateVariable} />
            </UiThemeProvider>,
        );

        expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();
    });

    it('should display the default placeholder', () => {
        const dateVariable = variables.find((item) => item.id === 'date-variable') as DateVariableType;
        render(
            <UiThemeProvider theme="platform">
                <DateVariable variable={dateVariable} />
            </UiThemeProvider>,
        );

        expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
    });
});

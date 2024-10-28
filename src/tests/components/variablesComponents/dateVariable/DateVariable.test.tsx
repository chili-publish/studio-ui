import { DateVariable as DateVariableType } from '@chili-publish/studio-sdk';
import { render, screen } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import DateVariable from '../../../../components/variablesComponents/dateVariable/DateVariable';
import { APP_WRAPPER_ID } from '../../../../utils/constants';
import { APP_WRAPPER } from '../../../shared.util/app';

describe('DateVariable', () => {
    it('should display the configured placeholder', async () => {
        const PLACEHOLDER = 'placeholder text';
        const variable = variables.find((item) => item.id === 'date-variable');
        const dateVariable = { ...variable, placeholder: PLACEHOLDER } as DateVariableType;
        render(
            <UiThemeProvider theme="platform">
                <DateVariable variable={dateVariable} />
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        expect(await screen.findByPlaceholderText(PLACEHOLDER)).toBeInTheDocument();
    });

    it('should display the default placeholder', () => {
        const dateVariable = variables.find((item) => item.id === 'date-variable') as DateVariableType;
        render(
            <UiThemeProvider theme="platform">
                <div id={APP_WRAPPER_ID}>
                    <DateVariable variable={dateVariable} />
                </div>
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
    });
});

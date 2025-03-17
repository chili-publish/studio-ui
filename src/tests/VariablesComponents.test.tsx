/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { DateVariable, ShortTextVariable, Variable } from '@chili-publish/studio-sdk';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import VariableComponent from '../components/variablesComponents/VariablesComponents';
import AppProvider from '../contexts/AppProvider';
import { variables } from './mocks/mockVariables';
import { APP_WRAPPER } from './shared.util/app';

jest.mock('../components/variablesComponents/imageVariable/useVariableConnector', () => ({
    useVariableConnector: () => ({
        selectedConnector: {
            supportedAuthentication: {
                browser: ['none'],
            },
        },
    }),
}));

Object.defineProperty(navigator, 'language', {
    value: 'en-GB',
    configurable: true,
});

describe('Variable Component', () => {
    beforeEach(() => {
        window.StudioUISDK.connector.getMappings = jest.fn().mockResolvedValue({
            parsedData: null,
        });
        window.StudioUISDK.variable.getAll = jest.fn().mockResolvedValue({
            parsedData: null,
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('Shows the image picker component for image variable', async () => {
        render(
            <AppProvider isDocumentLoaded>
                <UiThemeProvider theme="platform">
                    <VariableComponent
                        key={`variable-component-${variables[0].id}`}
                        type={variables[0].type} // image variable
                        variable={variables[0]}
                    />
                    ,
                </UiThemeProvider>
            </AppProvider>,
        );
        const variable = await waitFor(() => screen.getByText(variables[0].label!));
        expect(variable).toBeInTheDocument();
    });

    it('Shows the input component for short text variables', () => {
        const container = render(
            <AppProvider isDocumentLoaded>
                <UiThemeProvider theme="platform">
                    <VariableComponent
                        key={`variable-component-${variables[2].id}`}
                        type={variables[2].type} // short text variable
                        variable={variables[2]}
                    />
                </UiThemeProvider>
            </AppProvider>,
        );
        const input = container.container.getElementsByTagName('input')[0];
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 'I just got updated' } });
        fireEvent.blur(input);

        expect(screen.getByText('Short Variable 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('I just got updated')).toHaveAttribute('value', 'I just got updated');
    });
    it('Shows the text area component for multi line text variables', async () => {
        const user = userEvent.setup();
        const longText = variables.find((variable) => variable.id === 'multi-line-text-variable-1') as Variable;

        render(
            <AppProvider>
                <UiThemeProvider theme="platform">
                    <VariableComponent
                        key={`variable-component-${longText.id}`}
                        type={longText.type}
                        variable={longText}
                    />
                </UiThemeProvider>
            </AppProvider>,
        );

        const inputLong = screen.getByRole('textbox');
        await act(async () => {
            await user.click(inputLong);
            await user.type(inputLong, 'I am tying\n in the second line');
            await inputLong.blur();
        });

        expect(screen.getByText('Long text Var label')).toBeInTheDocument();
        expect(screen.getByText(/i am tying in the second line/i)).toBeInTheDocument();
    });
    it('Shows the number component for number variables', () => {
        const { getByRole, getAllByRole } = render(
            <AppProvider isDocumentLoaded>
                <UiThemeProvider theme="platform">
                    <VariableComponent
                        key={`variable-component-${variables[5].id}`}
                        type={variables[5].type}
                        variable={variables[5]}
                    />
                </UiThemeProvider>
            </AppProvider>,
        );
        const input = getByRole('textbox', { name: /number-variable/i });
        const stepBtns = getAllByRole('button');
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue('13.55');
        expect(stepBtns.length).toBe(2);

        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 12.11 } });
        fireEvent.blur(input);

        expect(input).toHaveValue('12.11');
    });

    describe('Shows date component for date date variable', () => {
        it('Correctly renders the date component for date variables', () => {
            render(
                <AppProvider isDocumentLoaded>
                    <UiThemeProvider theme="platform">
                        <VariableComponent
                            key={`variable-component-${variables[6].id}`}
                            type={variables[6].type}
                            variable={variables[6]}
                        />
                    </UiThemeProvider>
                </AppProvider>,
                { container: document.body.appendChild(APP_WRAPPER) },
            );
            const dateInput = screen.getByRole('textbox') as HTMLInputElement;
            expect(dateInput).toBeInTheDocument();
            expect(dateInput.value).toBe('07/30/2024');
        });
        it('Calls the onchange function when date is changed with correct params', async () => {
            const user = userEvent.setup();
            const { getByRole, getByText } = render(
                <AppProvider isDocumentLoaded>
                    <UiThemeProvider theme="platform">
                        <VariableComponent
                            key={`variable-component-${variables[6].id}`}
                            type={variables[6].type}
                            variable={variables[6]}
                        />
                    </UiThemeProvider>
                </AppProvider>,
                { container: document.body.appendChild(APP_WRAPPER) },
            );
            const dateInput = getByRole('textbox') as HTMLInputElement;
            await act(() => user.click(dateInput));

            await act(() => user.click(getByText('28'))); // the day 28 in the calendar

            expect(window.StudioUISDK.variable.setValue).toHaveBeenCalled();
            expect(window.StudioUISDK.variable.setValue).toHaveBeenCalledWith(variables[6].id, '2024-07-28');
        });

        it('Can set date to null by clearing the input field', async () => {
            const user = userEvent.setup();
            const { getByRole } = render(
                <AppProvider isDocumentLoaded>
                    <UiThemeProvider theme="platform">
                        <VariableComponent
                            key={`variable-component-${variables[6].id}`}
                            type={variables[6].type}
                            variable={variables[6]}
                        />
                    </UiThemeProvider>
                </AppProvider>,
                { container: document.body.appendChild(APP_WRAPPER) },
            );
            const dateInput = getByRole('textbox') as HTMLInputElement;
            await act(() => user.clear(dateInput));
            await act(() => fireEvent.blur(dateInput));
            expect(await screen.queryByText('30/07/2024')).toBeNull();
            expect(window.StudioUISDK.variable.setValue).toHaveBeenCalledWith(variables[6].id, '');
        });
        it('Select the correct date after clearing the input', async () => {
            // Regression test after QA found the selected date is 1 day before what user selects
            const user = userEvent.setup();
            const { getByRole, getByText } = render(
                <AppProvider isDocumentLoaded>
                    <UiThemeProvider theme="platform">
                        <VariableComponent
                            key={`variable-component-${variables[6].id}`}
                            type={variables[6].type}
                            variable={variables[6]}
                        />
                    </UiThemeProvider>
                </AppProvider>,
                { container: document.body.appendChild(APP_WRAPPER) },
            );
            const dateInput = getByRole('textbox') as HTMLInputElement;
            await act(() => user.clear(dateInput));
            await act(() => fireEvent.blur(dateInput));
            await act(() => user.click(dateInput));
            await act(() => user.click(getByText('28'))); // the day 28 in the calendar

            expect(window.StudioUISDK.variable.setValue).toHaveBeenCalled();
            expect(window.StudioUISDK.variable.setValue).toHaveBeenCalledWith(variables[6].id, '2024-07-28');
        });
        it('Correctly shows the excluded dates', async () => {
            const user = userEvent.setup();
            const { getByRole, getByText } = render(
                <AppProvider isDocumentLoaded>
                    <UiThemeProvider theme="platform">
                        <VariableComponent
                            key={`variable-component-${variables[6].id}`}
                            type={variables[6].type}
                            variable={{ ...variables[6], excludedDays: ['monday', 'friday'] } as DateVariable}
                        />
                    </UiThemeProvider>
                </AppProvider>,
                { container: document.body.appendChild(APP_WRAPPER) },
            );
            const dateInput = getByRole('textbox') as HTMLInputElement;
            await act(() => user.click(dateInput));
            expect(getByText(/mo/i)).toHaveStyle({ color: '#b3b3b3' }); // Monday should be greyed out
            expect(getByText(/fr/i)).toHaveStyle({ color: '#b3b3b3' }); // Friday should be greyed out
            expect(getByText(/22/i)).toHaveAttribute('aria-disabled', 'true'); // a Monday date
            expect(getByText(/26/i)).toHaveAttribute('aria-disabled', 'true'); // a Friday date
        });
    });
    it('Uses the variable label when available', async () => {
        const varWithoutLabel = variables.find(
            (item) => item.id === 'shortVariable-without-label',
        ) as ShortTextVariable;

        render(
            <AppProvider isDocumentLoaded>
                <UiThemeProvider theme="platform">
                    <VariableComponent
                        key={`variable-component-${varWithoutLabel.id}`}
                        type={varWithoutLabel.type}
                        variable={{ ...varWithoutLabel, label: 'Var label' }}
                    />
                </UiThemeProvider>
            </AppProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        const variable = await waitFor(() => screen.getByText('Var label'));
        expect(variable).toBeInTheDocument();
    });
});

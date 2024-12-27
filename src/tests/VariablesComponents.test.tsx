import { UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { DateVariable, ShortTextVariable } from '@chili-publish/studio-sdk';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import VariableComponent from '../components/variablesComponents/VariablesComponents';
import * as FeatureFlagContext from '../contexts/FeatureFlagProvider';
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

jest.spyOn(FeatureFlagContext, 'useFeatureFlagContext').mockImplementation(() => {
    return {
        featureFlags: { STUDIO_LABEL_PROPERTY_ENABLED: true },
    };
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
            <UiThemeProvider theme="platform">
                <VariableComponent
                    key={`variable-component-${variables[0].id}`}
                    type={variables[0].type} // image variable
                    variable={variables[0]}
                    isDocumentLoaded
                />
                ,
            </UiThemeProvider>,
        );
        const variable = await waitFor(() => screen.getByText(variables[0].label!));
        expect(variable).toBeInTheDocument();
    });

    it('Shows the input component for short text and long text variables', () => {
        let container = render(
            <UiThemeProvider theme="platform">
                <VariableComponent
                    key={`variable-component-${variables[2].id}`}
                    type={variables[2].type} // short text variable
                    variable={variables[2]}
                    isDocumentLoaded
                />
            </UiThemeProvider>,
        );
        const input = container.container.getElementsByTagName('input')[0];
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 'I just got updated' } });
        fireEvent.blur(input);

        expect(screen.getByText('Short Variable 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('I just got updated')).toHaveAttribute('value', 'I just got updated');

        container = render(
            <UiThemeProvider theme="platform">
                <VariableComponent
                    key={`variable-component-${variables[3].id}`}
                    type={variables[3].type} // short text variable
                    variable={variables[3]}
                    isDocumentLoaded
                />
            </UiThemeProvider>,
        );

        const inputLong = container.container.getElementsByTagName('input')[0];
        fireEvent.focus(inputLong);
        fireEvent.change(inputLong, { target: { value: 'I just got longer' } });
        fireEvent.blur(inputLong);

        expect(screen.getByText('Long Variable 1 Label')).toBeInTheDocument();
        expect(screen.getByDisplayValue('I just got longer')).toHaveAttribute('value', 'I just got longer');
    });
    it('Shows the number component for number variables', () => {
        const { getByRole, getAllByRole } = render(
            <UiThemeProvider theme="platform">
                <VariableComponent
                    key={`variable-component-${variables[5].id}`}
                    type={variables[5].type}
                    variable={variables[5]}
                    isDocumentLoaded
                />
            </UiThemeProvider>,
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
                <UiThemeProvider theme="platform">
                    <VariableComponent
                        key={`variable-component-${variables[6].id}`}
                        type={variables[6].type}
                        variable={variables[6]}
                        isDocumentLoaded
                    />
                </UiThemeProvider>,
                { container: document.body.appendChild(APP_WRAPPER) },
            );
            const dateInput = screen.getByRole('textbox') as HTMLInputElement;
            expect(dateInput).toBeInTheDocument();
            expect(dateInput.value).toBe('07/30/2024');
        });
        it('Calls the onchange function when date is changed with correct params', async () => {
            const user = userEvent.setup();
            const { getByRole, getByText } = render(
                <UiThemeProvider theme="platform">
                    <VariableComponent
                        key={`variable-component-${variables[6].id}`}
                        type={variables[6].type}
                        variable={variables[6]}
                        isDocumentLoaded
                    />
                </UiThemeProvider>,
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
                <UiThemeProvider theme="platform">
                    <VariableComponent
                        key={`variable-component-${variables[6].id}`}
                        type={variables[6].type}
                        variable={variables[6]}
                        isDocumentLoaded
                    />
                </UiThemeProvider>,
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
                <UiThemeProvider theme="platform">
                    <VariableComponent
                        key={`variable-component-${variables[6].id}`}
                        type={variables[6].type}
                        variable={variables[6]}
                        isDocumentLoaded
                    />
                </UiThemeProvider>,
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
                <UiThemeProvider theme="platform">
                    <VariableComponent
                        key={`variable-component-${variables[6].id}`}
                        type={variables[6].type}
                        variable={{ ...variables[6], excludedDays: ['monday', 'friday'] } as DateVariable}
                        isDocumentLoaded
                    />
                </UiThemeProvider>,
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
            <UiThemeProvider theme="platform">
                <VariableComponent
                    key={`variable-component-${varWithoutLabel.id}`}
                    type={varWithoutLabel.type}
                    variable={{ ...varWithoutLabel, label: 'Var label' }}
                    isDocumentLoaded
                />
            </UiThemeProvider>,
            { container: document.body.appendChild(APP_WRAPPER) },
        );

        const variable = await waitFor(() => screen.getByText('Var label'));
        expect(variable).toBeInTheDocument();
    });
});

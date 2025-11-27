import { getDataTestId, UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { ConfigType, NumberVariable as Type } from '@chili-publish/studio-sdk';
import { act, render, screen, within } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import userEvent from '@testing-library/user-event';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import StudioUI from 'src/main';
import NumberVariable from '../../../../components/variablesComponents/NumberVariable';

jest.mock('@chili-publish/studio-sdk');

const environmentBaseURL = 'https://test-api.test.com/grafx/api/v1/environment/test-api';
const projectID = 'projectId';
const token = 'token';

const config = {
    selector: 'sui-root',

    projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
    projectId: projectID,
    graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
    authToken: token,
    projectName: 'Number Variable',
    onVariableFocus: jest.fn(),
    onVariableBlur: jest.fn(),
    onVariableValueChangedCompleted: jest.fn().mockImplementation(async () => {
        return Promise.resolve();
    }),
};

jest.mock('@chili-publish/studio-sdk', () => {
    const originalModule = jest.requireActual('@chili-publish/studio-sdk');

    return {
        __esModule: true,
        ...originalModule,
        /* eslint-disable */
        default: function (config: ConfigType) {
            const sdk = new originalModule.default(config);
            /* eslint-enable */
            return {
                ...sdk,
                configuration: {
                    setValue: jest.fn(),
                },
                tool: {
                    setHand: jest.fn(),
                },
                layout: {
                    getSelected: jest
                        .fn()
                        .mockImplementation(() => Promise.resolve({ success: true, parsedData: mockLayout })),
                },
            };
        },
    };
});

describe('NumberVariable', () => {
    it('should display label as variable label if label exists and empty', () => {
        const variable = variables.find((item) => item.id === 'number-variable');
        const numberVariable = { ...variable, label: '' } as Type;
        render(
            <UiThemeProvider theme="platform">
                <NumberVariable variable={numberVariable} onValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(numberVariable.label);
    });

    it('should display label as variable label', () => {
        const variable = variables.find((item) => item.id === 'number-variable');
        const numberVariable = { ...variable } as Type;
        render(
            <UiThemeProvider theme="platform">
                <NumberVariable variable={numberVariable} onValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(numberVariable.label);
    });

    it('should display name as variable name if label does not exist in the object', () => {
        const variable = variables.find((item) => item.id === 'number-variable');
        const numberVariable = { ...variable } as Type;
        delete (numberVariable as unknown as { [key: string]: string }).label;

        render(
            <UiThemeProvider theme="platform">
                <NumberVariable variable={numberVariable} onValueChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(numberVariable.name);
    });

    it('should focus blur if stepper is used', async () => {
        const { container } = render(<div id="sui-root" />);
        const user = userEvent.setup();
        await act(() => {
            StudioUI.studioUILoaderConfig(config);
        });
        const variable = variables.find((item) => item.id === 'number-variable');
        const numberVariable = { ...variable } as Type;
        await act(() => {
            window.StudioUISDK.config.events.onLayoutsChanged.trigger(mockLayouts);
            window.StudioUISDK.config.events.onSelectedLayoutIdChanged.trigger(mockLayout.id);
            window.StudioUISDK.config.events.onVariableListChanged.trigger([numberVariable]);
        });

        const inputWrapper = container.querySelector(`[data-id="sui-input-number-${numberVariable.id}-input-wrapper"]`);
        expect(inputWrapper).toBeInTheDocument();
        const buttons = await within(inputWrapper as HTMLElement).findAllByRole('button');
        const minusButton = buttons[0];
        const plusButton = buttons[1];

        // Click minus button
        await user.click(minusButton);
        expect(config.onVariableFocus).toHaveBeenCalledTimes(1);
        expect(config.onVariableBlur).toHaveBeenCalledTimes(1);

        // Click plus button
        await user.click(plusButton);
        expect(config.onVariableFocus).toHaveBeenCalledTimes(1);
        expect(config.onVariableBlur).toHaveBeenCalledTimes(1);
    });
});

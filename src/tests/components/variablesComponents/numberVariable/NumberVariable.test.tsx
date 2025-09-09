import { getDataTestId, UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { ConfigType, NumberVariable as Type } from '@chili-publish/studio-sdk';
import { act, render, screen, within } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import userEvent from '@testing-library/user-event';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import StudioUI from 'src/main';
import { createMockEnvironmentClientApis } from '@tests/mocks/environmentClientApi';
import { mockApiUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting, mockOutputSetting2 } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import NumberVariable from '../../../../components/variablesComponents/NumberVariable';

jest.mock('@chili-publish/studio-sdk');

// Mock environment client API
jest.mock('@chili-publish/environment-client-api', () => ({
    ConnectorsApi: jest.fn().mockImplementation(() => ({})),
    ProjectsApi: jest.fn().mockImplementation(() => ({
        apiV1EnvironmentEnvironmentProjectsProjectIdGet: jest.fn().mockResolvedValue(mockProject),
        apiV1EnvironmentEnvironmentProjectsProjectIdDocumentGet: jest
            .fn()
            .mockResolvedValue({ data: '{"test": "document"}' }),
        apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut: jest.fn().mockResolvedValue({ success: true }),
    })),
    UserInterfacesApi: jest.fn().mockImplementation(() => ({
        apiV1EnvironmentEnvironmentUserInterfacesGet: jest.fn().mockResolvedValue({ data: [mockApiUserInterface] }),
        apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet: jest.fn().mockResolvedValue(mockApiUserInterface),
    })),
    SettingsApi: jest.fn().mockImplementation(() => ({})),
    OutputApi: jest.fn().mockImplementation(() => ({
        apiV1EnvironmentEnvironmentOutputSettingsGet: jest
            .fn()
            .mockResolvedValue({ data: [mockOutputSetting, mockOutputSetting2] }),
    })),
    Configuration: jest.fn().mockImplementation(() => ({})),
}));

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const token = 'token';

// Mock environment client APIs for testing
const mockEnvironmentClientApis = createMockEnvironmentClientApis();

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
    environmentClientApis: mockEnvironmentClientApis,
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

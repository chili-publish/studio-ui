import { getDataTestId, UiThemeProvider } from '@chili-publish/grafx-shared-components';
import { ListVariable as Type } from '@chili-publish/studio-sdk/lib/src/next';
import { act, render, screen } from '@testing-library/react';
import { variables } from '@tests/mocks/mockVariables';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import { ConfigType } from '@chili-publish/studio-sdk';
import userEvent from '@testing-library/user-event';
import StudioUI from 'src/main';
import { createMockEnvironmentClientApis } from '@tests/mocks/environmentClientApi';
import { mockApiUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting, mockOutputSetting2 } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import ListVariable from '../../../../components/variablesComponents/listVariable/ListVariable';

jest.mock('@chili-publish/studio-sdk');
jest.mock('axios');

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

describe('ListVariable', () => {
    it('should display label as variable name if label is empty', () => {
        const variable = variables.find((item) => item.id === '10');
        const listVariable = { ...variable, label: '' } as Type;
        render(
            <UiThemeProvider theme="platform">
                <ListVariable variable={listVariable} onChange={jest.fn()} />;
            </UiThemeProvider>,
        );
        const variableLabel = screen.queryByTestId(getDataTestId('input-label'));
        // the label is empty string won't be rendered
        expect(variableLabel).toBeNull();
    });

    it('should display label as variable label', () => {
        const variable = variables.find((item) => item.id === '10');
        const listVariable = { ...variable } as Type;
        render(
            <UiThemeProvider theme="platform">
                <ListVariable variable={listVariable} onChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(listVariable.label);
    });

    it('should display label as variable name if label does not exist', () => {
        const variable = variables.find((item) => item.id === '10');
        const listVariable = { ...variable } as Type;
        delete (listVariable as unknown as { [key: string]: string }).label;

        render(
            <UiThemeProvider theme="platform">
                <ListVariable variable={listVariable} onChange={jest.fn()} />;
            </UiThemeProvider>,
        );

        expect(screen.getByTestId(getDataTestId('input-label')).innerHTML).toEqual(listVariable.name);
    });

    it('should focus and blur  if stepper is used', async () => {
        render(<div id="sui-root" />);
        const user = userEvent.setup();
        await act(() => {
            StudioUI.studioUILoaderConfig(config);
        });
        const variable = variables.find((item) => item.id === '10');
        const listVariable = { ...variable } as Type;
        delete (listVariable as unknown as { [key: string]: string }).label;
        await act(() => {
            window.StudioUISDK.config.events.onLayoutsChanged.trigger(mockLayouts);
            window.StudioUISDK.config.events.onSelectedLayoutIdChanged.trigger(mockLayout.id);
            window.StudioUISDK.config.events.onVariableListChanged.trigger([listVariable]);
        });
        const select = screen.getByRole('combobox', {
            name: /select item/i,
        });
        expect(select).toBeInTheDocument();
        await user.click(select);
        const option = screen.getByRole('option', {
            name: /val 1/i,
        });
        expect(option).toBeInTheDocument();
        await user.click(option);
        expect(config.onVariableFocus).toHaveBeenCalledTimes(1);
        expect(config.onVariableBlur).toHaveBeenCalledTimes(1);
    });
});

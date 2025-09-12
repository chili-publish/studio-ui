import { ConfigType, ConnectorRegistrationSource, LayoutPropertiesType } from '@chili-publish/studio-sdk';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import { mockOutputSetting, mockOutputSetting2 } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockApiUserInterface, mockUserInterface } from '@mocks/mockUserinterface';
import { act, render, screen, waitFor } from '@testing-library/react';
import StudioUI from '../../main';
import { IStudioUILoaderConfig, UserInterface } from '../../types/types';
import { createMockEnvironmentClientApis } from '../mocks/environmentClientApi';

import { variables } from '../mocks/mockVariables';

jest.mock('@chili-publish/studio-sdk');

// Mock the entire environment client API module
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
        apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet: jest.fn().mockImplementation((params) => {
            // Return custom UI data for specific test cases
            if (params.userInterfaceId === mockApiUserInterface.id) {
                // Return UI with custom formBuilder for most tests
                const formBuilder = [
                    {
                        type: 'datasource' as const,
                        active: true,
                        header: 'Data source active',
                        helpText: 'Select a data source',
                    },
                    {
                        type: 'layouts' as const,
                        active: true,
                        header: 'Layouts from user interface',
                        helpText: 'Layouts help text',
                        layoutSelector: true,
                        showWidthHeightInputs: true,
                        multipleLayouts: true,
                        allowNewProjectFromLayout: true,
                    },
                    {
                        type: 'variables' as const,
                        active: true,
                        header: 'Variables from user interface',
                        helpText: 'Change the variables',
                    },
                ];
                const customUI = { ...mockApiUserInterface, formBuilder: JSON.stringify(formBuilder) };
                return Promise.resolve(customUI);
            }
            return Promise.resolve(mockApiUserInterface);
        }),
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
    projectName: '',
    onVariableFocus: () => jest.fn(),
    onVariableBlur: () => jest.fn(),
    userInterfaceID: mockUserInterface.id,
    environmentClientApis: mockEnvironmentClientApis,
};
const LoadStudioUI = async (loaderConfig: IStudioUILoaderConfig) => {
    render(<div id="sui-root" />);

    await act(() => {
        StudioUI.studioUILoaderConfig(loaderConfig);
    });

    await act(() => {
        window.StudioUISDK.config.events.onVariableListChanged.trigger(variables);
        window.StudioUISDK.config.events.onLayoutsChanged.trigger(mockLayouts);
        window.StudioUISDK.config.events.onSelectedLayoutIdChanged.trigger(mockLayout.id);
        window.StudioUISDK.config.events.onSelectedLayoutPropertiesChanged.trigger(
            mockLayout as unknown as LayoutPropertiesType,
        );
    });
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
                document: {
                    load: jest.fn().mockImplementation(() => Promise.resolve({ success: false })),
                    getCurrentState: jest
                        .fn()
                        .mockImplementation(() => Promise.resolve({ parsedData: {}, data: '{}' })),
                },
                loadEditor: jest.fn(),
                configuration: {
                    setValue: jest.fn(),
                },
                tool: {
                    setHand: jest.fn(),
                },
                canvas: {
                    zoomToPage: jest.fn().mockImplementation(() => Promise.resolve({ success: true })),
                },
                layout: {
                    getSelected: jest
                        .fn()
                        .mockImplementation(() => Promise.resolve({ success: true, parsedData: mockLayout })),
                },
                dataSource: {
                    getDataSource: jest.fn().mockImplementation(() =>
                        Promise.resolve({
                            success: true,
                            parsedData: {
                                id: '1',
                                name: 'Connector name',
                            },
                        }),
                    ),
                },
                connector: {
                    getById: jest.fn().mockResolvedValue({
                        success: true,
                        parsedData: {
                            source: {
                                url: 'http://deploy.com/media-connector',
                                source: ConnectorRegistrationSource.url,
                            },
                            supportedAuthentication: { browser: ['oAuth2AuthorizationCode'] },
                        },
                    }),
                },
                undoManager: {
                    setCustomUndoData: jest.fn().mockResolvedValue({ success: true }),
                    addCustomData: jest.fn().mockResolvedValue({ success: true }),
                },
                next: {
                    connector: {
                        getAllByType: jest.fn().mockResolvedValue({ success: true, parsedData: [] }),
                        getById: jest.fn().mockResolvedValue({
                            success: true,
                            parsedData: {
                                source: {
                                    url: 'http://deploy.com/media-connector',
                                    source: ConnectorRegistrationSource.url,
                                },
                                supportedAuthentication: { browser: ['oAuth2AuthorizationCode'] },
                            },
                        }),
                    },
                },
            };
        },
    };
});

describe('FormBuilder options', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    afterAll(() => {
        jest.resetAllMocks();
    });
    it('should fallback to form builder data of the user interface if onFetchUserInterfaceDetails is not provided', async () => {
        await LoadStudioUI(config);

        expect(screen.getByText('Variables from user interface')).toBeInTheDocument();
        expect(screen.getByText('Layouts from user interface')).toBeInTheDocument();
    });
    it('should fallback to default form builder if form builder data of the user interface is undefined and onFetchUserInterfaceDetails is not provided', async () => {
        // Temporarily override the mock for this specific test
        const originalMock = jest.requireMock('@chili-publish/environment-client-api').UserInterfacesApi;
        // eslint-disable-next-line new-cap
        const mockInstance = new originalMock();
        mockInstance.apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet = jest
            .fn()
            .mockImplementation((params) => {
                if (params.userInterfaceId === mockApiUserInterface.id) {
                    // Return UI with undefined formBuilder for this specific test
                    const customUI = { ...mockApiUserInterface, formBuilder: undefined };
                    return Promise.resolve(customUI);
                }
                return Promise.resolve(mockApiUserInterface);
            });

        // Override the constructor to return our custom instance
        jest.requireMock('@chili-publish/environment-client-api').UserInterfacesApi.mockImplementation(
            () => mockInstance,
        );

        await LoadStudioUI(config);
        expect(screen.getByText('Customize')).toBeInTheDocument();
        expect(screen.getByText('Layouts')).toBeInTheDocument();
    });

    it('should render default sections when form builder data is not provided', async () => {
        await LoadStudioUI({
            ...config,
            onFetchUserInterfaceDetails: () =>
                Promise.resolve({
                    id: '1',
                    name: 'name',
                    outputSettings: [
                        { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                    ],
                    formBuilder: undefined,
                    outputSettingsFullList: [],
                } as unknown as UserInterface),
        });

        await waitFor(() => {
            expect(screen.getByText('Data source')).toBeInTheDocument();
            expect(screen.getByText('Layouts')).toBeInTheDocument();
            expect(screen.getByText('Customize')).toBeInTheDocument();
        });
    });

    it('should render all active form builder sections with correct headers', async () => {
        await LoadStudioUI({
            ...config,
            onFetchUserInterfaceDetails: () =>
                Promise.resolve({
                    id: '1',
                    name: 'name',
                    outputSettings: [
                        { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                    ],
                    formBuilder: mockUserInterface.formBuilder,
                    outputSettingsFullList: [],
                } as unknown as UserInterface),
        });
        await waitFor(() => {
            expect(screen.getByText('Data source')).toBeInTheDocument();
            expect(screen.getByText('Layouts')).toBeInTheDocument();
            expect(screen.getByText('Variables')).toBeInTheDocument();
        });
    });

    it('should not render inactive form builder sections', async () => {
        const formBuilder = [
            {
                type: 'datasource' as const,
                active: true,
                header: 'Data source active',
                helpText: 'Select a data source',
            },
            {
                type: 'layouts' as const,
                active: false,
                header: 'Layouts',
                helpText: 'Layouts help text',
                layoutSelector: true,
                multipleLayouts: true,
                allowNewProjectFromLayout: true,
                showWidthHeightInputs: true,
            },
            {
                type: 'variables' as const,
                active: false,
                header: 'Variables',
                helpText: 'Change the variables',
            },
        ];

        await LoadStudioUI({
            ...config,
            onFetchUserInterfaceDetails: () =>
                Promise.resolve({
                    id: '1',
                    name: 'name',
                    outputSettings: [
                        { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                    ],
                    formBuilder,
                    outputSettingsFullList: [],
                } as unknown as UserInterface),
        });

        await waitFor(() => {
            expect(screen.getByText('Data source active')).toBeInTheDocument();
            expect(screen.queryByText('Layouts')).toBeNull();
            expect(screen.queryByText('Variables')).toBeNull();
        });
    });

    it('should display help text for each section', async () => {
        const formBuilder = [
            {
                type: 'datasource' as const,
                active: true,
                header: 'Data source active',
                helpText: 'Select a data source',
            },
            {
                type: 'layouts' as const,
                active: true,
                header: 'Layouts',
                helpText: 'Layouts help text',
                layoutSelector: true,
                multipleLayouts: true,
                allowNewProjectFromLayout: true,
                showWidthHeightInputs: true,
            },
            {
                type: 'variables' as const,
                active: true,
                header: 'Variables',
                helpText: 'Change the variables',
            },
        ];

        await LoadStudioUI({
            ...config,
            onFetchUserInterfaceDetails: () =>
                Promise.resolve({
                    id: '1',
                    name: 'name',
                    outputSettings: [
                        { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                    ],
                    formBuilder,
                    outputSettingsFullList: [],
                } as unknown as UserInterface),
        });

        await waitFor(() => {
            expect(screen.getByText('Select a data source')).toBeInTheDocument();
            expect(screen.queryByText('Layouts help text')).toBeInTheDocument();
            expect(screen.queryByText('Change the variables')).toBeInTheDocument();
        });
    });

    it('should handle layout section specific properties show all sections if all true', async () => {
        const formBuilder = [
            {
                type: 'datasource' as const,
                active: true,
                header: 'Data source active',
                helpText: 'Select a data source',
            },
            {
                type: 'layouts' as const,
                active: true,
                header: 'Layouts',
                helpText: 'Layouts help text',
                layoutSelector: true,
                multipleLayouts: true,
                allowNewProjectFromLayout: true,
                showWidthHeightInputs: true,
            },
            {
                type: 'variables' as const,
                active: true,
                header: 'Variables',
                helpText: 'Change the variables',
            },
        ];

        await LoadStudioUI({
            ...config,
            onFetchUserInterfaceDetails: () =>
                Promise.resolve({
                    id: '1',
                    name: 'name',
                    outputSettings: [
                        { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                    ],
                    formBuilder,
                    outputSettingsFullList: [],
                } as unknown as UserInterface),
        });

        await waitFor(() => {
            expect(
                screen.getByRole('combobox', {
                    name: /L1 display name/i,
                }),
            ).toBeInTheDocument();

            expect(
                screen.getByRole('textbox', {
                    name: /page-width-input/i,
                }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('textbox', {
                    name: /page-height-input/i,
                }),
            ).toBeInTheDocument();
        });
    });

    it('should hide layout section if all layout properties are false', async () => {
        const formBuilder = [
            {
                type: 'datasource' as const,
                active: true,
                header: 'Data source active',
                helpText: 'Select a data source',
            },
            {
                type: 'layouts' as const,
                active: true,
                header: 'Layouts',
                helpText: 'Layouts help text',
                layoutSelector: false,
                multipleLayouts: false,
                allowNewProjectFromLayout: false,
                showWidthHeightInputs: false,
            },
            {
                type: 'variables' as const,
                active: true,
                header: 'Variables',
                helpText: 'Change the variables',
            },
        ];

        await LoadStudioUI({
            ...config,
            onFetchUserInterfaceDetails: () =>
                Promise.resolve({
                    id: '1',
                    name: 'name',
                    outputSettings: [
                        { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                    ],
                    formBuilder,
                    outputSettingsFullList: [],
                } as unknown as UserInterface),
        });

        expect(screen.queryByText('Layouts')).toBeNull();
        expect(screen.queryByText('Layouts help text')).toBeNull();
    });

    it('should show layout selection dropdown if set to true', async () => {
        const formBuilder = [
            {
                type: 'datasource' as const,
                active: true,
                header: 'Data source active',
                helpText: 'Select a data source',
            },
            {
                type: 'layouts' as const,
                active: true,
                header: 'Layouts',
                helpText: 'Layouts help text',
                layoutSelector: true,
                showWidthHeightInputs: false,
                multipleLayouts: false,
                allowNewProjectFromLayout: false,
            },
            {
                type: 'variables' as const,
                active: true,
                header: 'Variables',
                helpText: 'Change the variables',
            },
        ];

        await LoadStudioUI({
            ...config,
            onFetchUserInterfaceDetails: () =>
                Promise.resolve({
                    id: '1',
                    name: 'name',
                    outputSettings: [
                        { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                    ],
                    formBuilder,
                    outputSettingsFullList: [],
                } as unknown as UserInterface),
        });
        await waitFor(() => {
            expect(
                screen.getByRole('combobox', {
                    name: /display name/i,
                }),
            ).toBeInTheDocument();
        });
    });

    it('should show width/height inputs if set to true', async () => {
        const formBuilder = [
            {
                type: 'datasource' as const,
                active: true,
                header: 'Data source active',
                helpText: 'Select a data source',
            },
            {
                type: 'layouts' as const,
                active: true,
                header: 'Layouts',
                helpText: 'Layouts help text',
                layoutSelector: false,
                showWidthHeightInputs: true,
                multipleLayouts: false,
                allowNewProjectFromLayout: false,
            },
            {
                type: 'variables' as const,
                active: true,
                header: 'Variables',
                helpText: 'Change the variables',
            },
        ];

        await LoadStudioUI({
            ...config,
            onFetchUserInterfaceDetails: () =>
                Promise.resolve({
                    id: '1',
                    name: 'name',
                    outputSettings: [
                        { ...mockOutputSetting, layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'] },
                    ],
                    formBuilder,
                    outputSettingsFullList: [],
                } as unknown as UserInterface),
        });

        await waitFor(() => {
            expect(
                screen.getByRole('textbox', {
                    name: /page-width-input/i,
                }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('textbox', {
                    name: /page-height-input/i,
                }),
            ).toBeInTheDocument();
        });
    });
});

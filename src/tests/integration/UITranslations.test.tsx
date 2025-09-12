import { act, render, screen } from '@testing-library/react';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import { ConfigType } from '@chili-publish/studio-sdk';
import axios from 'axios';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting, mockOutputSetting2 } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import userEvent from '@testing-library/user-event';
import { getDataTestIdForSUI } from 'src/utils/dataIds';
import { createMockEnvironmentClientApis } from '../mocks/environmentClientApi';
import StudioUI from '../../main';

jest.mock('@chili-publish/studio-sdk');
jest.mock('axios');

// Mock environment client API
jest.mock('@chili-publish/environment-client-api', () => ({
    ConnectorsApi: jest.fn().mockImplementation(() => ({
        getById: jest.fn().mockResolvedValue({ parsedData: { source: { url: 'http://deploy.com/data-connector' } } }),
        getAll: jest.fn().mockResolvedValue({ parsedData: [] }),
    })),
    ProjectsApi: jest.fn().mockImplementation(() => ({
        apiV1EnvironmentEnvironmentProjectsProjectIdGet: jest.fn().mockResolvedValue(mockProject),
        apiV1EnvironmentEnvironmentProjectsProjectIdDocumentGet: jest
            .fn()
            .mockResolvedValue({ data: '{"test": "document"}' }),
        apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut: jest.fn().mockResolvedValue({ success: true }),
    })),
    UserInterfacesApi: jest.fn().mockImplementation(() => ({
        apiV1EnvironmentEnvironmentUserInterfacesGet: jest.fn().mockResolvedValue({ data: [mockUserInterface] }),
        apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet: jest.fn().mockResolvedValue(mockUserInterface),
    })),
    SettingsApi: jest.fn().mockImplementation(() => ({})),
    OutputApi: jest.fn().mockImplementation(() => ({
        apiV1EnvironmentEnvironmentOutputSettingsGet: jest
            .fn()
            .mockResolvedValue({ data: [mockOutputSetting, mockOutputSetting2] }),
    })),
    Configuration: jest.fn().mockImplementation(() => ({})),
}));

// Mock environment client APIs for testing
const mockEnvironmentClientApis = createMockEnvironmentClientApis();

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const projectInfoUrl = `${environmentBaseURL}/projects/${projectID}`;

const mockUITranslations = {
    formBuilder: {
        variables: {
            header: 'Vars translated',
            helpText: 'Vars help translated',
        },
        datasource: {
            header: 'DS translated',
            helpText: 'DS help translated',
            row: 'Row translated',
            inputLabel: 'Data row translated',
        },
        layouts: {
            header: 'Layouts translated',
            helpText: 'Layouts help translated',
            inputLabel: 'Select layout translated',
            width: 'Width translated',
            height: 'Height translated',
        },
    },
    toolBar: {
        downloadButton: {
            label: 'Download translated',
            outputSelector: {
                label: 'Output translated',
            },
        },
    },
};

const config = {
    selector: 'sui-root',
    projectUploadUrl: 'http://abc.com/projects/projectId',
    projectId: 'projectId',
    graFxStudioEnvironmentApiBaseUrl: 'http://abc.com',
    authToken: 'token',
    projectName: '',
    uiTranslations: mockUITranslations,
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
                document: { load: jest.fn().mockImplementation(() => Promise.resolve({ success: true })) },
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
                    setDataRow: jest.fn(),
                },
                dataConnector: {
                    getPage: jest.fn().mockResolvedValueOnce({
                        parsedData: {
                            data: [
                                { id: '1', name: 'Joe', age: 15 },
                                { id: '2', name: 'Oliver', age: 105 },
                            ],
                        },
                    }),
                },
            };
        },
    };
});
describe('UITranslations Integration', () => {
    beforeEach(() => {
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
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url === `${environmentBaseURL}/user-interfaces`)
                return Promise.resolve({ status: 200, data: { data: [mockUserInterface] } });
            if (url === `${environmentBaseURL}/user-interfaces/${mockUserInterface.id}`)
                return Promise.resolve({ status: 200, data: formBuilder });
            if (url === `${environmentBaseURL}/output/settings`)
                return Promise.resolve({ status: 200, data: { data: [mockOutputSetting, mockOutputSetting2] } });
            if (url === projectDownloadUrl) return Promise.resolve({ data: {} });
            if (url === projectInfoUrl) return Promise.resolve({ data: mockProject });
            if (url === 'http://deploy.com/data-connector')
                return Promise.resolve({
                    data: {
                        id: 'data-connector',
                        supportedAuthentication: { browser: ['oAuth2AuthorizationCode'] },
                    },
                });

            if (url === 'http://deploy.com/media-connector')
                return Promise.resolve({
                    data: {
                        id: 'media-connector',
                        supportedAuthentication: { browser: ['oAuth2AuthorizationCode'] },
                    },
                });
            return Promise.resolve({ data: {} });
        });
        render(<div id="sui-root" />);
    });

    it('should render translated UI labels', async () => {
        const user = userEvent.setup();
        await act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        await act(() => {
            window.StudioUISDK.config.events.onLayoutsChanged.trigger(mockLayouts);
            window.StudioUISDK.config.events.onSelectedLayoutIdChanged.trigger(mockLayout.id);
        });

        // datasource
        expect(screen.getByText('DS translated')).toBeInTheDocument();
        expect(screen.getByText('DS help translated')).toBeInTheDocument();

        // layouts
        expect(screen.getByText('Layouts translated')).toBeInTheDocument();
        expect(screen.getByText('Layouts help translated')).toBeInTheDocument();
        expect(screen.getByText('Select layout translated')).toBeInTheDocument();
        expect(screen.getByText('Width translated')).toBeInTheDocument();
        expect(screen.getByText('Height translated')).toBeInTheDocument();

        // variables
        expect(screen.getByText('Vars translated')).toBeInTheDocument();
        expect(screen.getByText('Vars help translated')).toBeInTheDocument();

        // toolBar
        expect(screen.getByText('Download translated')).toBeInTheDocument();
        const downloadBtn = screen.getByTestId(getDataTestIdForSUI('navbar-item-download-translated'))
            .firstChild as HTMLButtonElement;
        await user.click(downloadBtn);
        expect(screen.getByText('Output translated')).toBeInTheDocument();
    });
});

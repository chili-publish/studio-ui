import { act, render, screen, waitFor } from '@testing-library/react';
import { mockLayout, mockLayouts } from '@mocks/mockLayout';
import { ConfigType } from '@chili-publish/studio-sdk';
import { getDataTestIdForSUI } from 'src/utils/dataIds';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
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
        apiV1EnvironmentEnvironmentOutputSettingsGet: jest.fn().mockResolvedValue({ data: [mockOutputSetting] }),
    })),
    Configuration: jest.fn().mockImplementation(() => ({})),
}));

// Mock environment client APIs for testing
const mockEnvironmentClientApis = createMockEnvironmentClientApis();

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const token = 'token';

const layoutTranslations = {
    L1: { displayName: 'Translated L1' },
    L2: { displayName: 'Translated L2' },
    L3: { displayName: 'Translated L3' },
    L4: { displayName: 'Translated L4' },
    L5: { displayName: 'Translated L5' },
};

const config = {
    selector: 'sui-root',
    // projectDownloadUrl, // Commented out to use environment client API
    projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
    projectId: projectID,
    graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
    authToken: token,
    projectName: 'Layout translation',
    layoutTranslations,
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

describe('Layout Translations Integration', () => {
    beforeEach(() => {
        (axios.get as jest.Mock).mockImplementation(() => {
            return Promise.resolve({ data: [] });
        });
        render(<div id="sui-root" />);
    });

    it('should render translated layout display names in the dropdown', async () => {
        const user = userEvent.setup();
        await act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        await act(() => {
            window.StudioUISDK.config.events.onLayoutsChanged.trigger(mockLayouts);
            window.StudioUISDK.config.events.onSelectedLayoutIdChanged.trigger(mockLayout.id);
        });

        const layoutsContainer = screen.getByTestId(getDataTestIdForSUI('dropdown-available-layout'));
        const selectIndicator = layoutsContainer.getElementsByClassName('grafx-select__dropdown-indicator')[0];
        await user.click(selectIndicator);

        // Wait for the dropdown to appear and check for translated names
        await waitFor(() => {
            expect(screen.getAllByText('Translated L1')[0]).toBeInTheDocument(); // Selected Option
            expect(screen.getAllByText('Translated L1')[1]).toBeInTheDocument(); // Option in the Select
            expect(screen.getByText('Translated L2')).toBeInTheDocument();
            expect(screen.getByText('Translated L3')).toBeInTheDocument();
            expect(screen.getByText('Translated L4')).toBeInTheDocument();
            expect(screen.getByText('Translated L5')).toBeInTheDocument();
        });
    });
});

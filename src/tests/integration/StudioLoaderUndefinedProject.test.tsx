import { connectorSourceUrl } from '@tests/mocks/sdk.mock';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { act, render, screen, waitFor } from '@testing-library/react';
import StudioUI from '../../main';

const environmentBaseURL = 'environmentBaseURL';
const projectID = 'projectId';
const projectName = 'projectName';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const token = 'auth-token';

// Mock ProjectDataClient
jest.mock('../../services/ProjectDataClient', () => ({
    ProjectDataClient: jest.fn().mockImplementation(() => ({
        fetchFromUrl: jest.fn().mockResolvedValue('{"test": "document"}'),
        saveToUrl: jest.fn().mockResolvedValue(undefined),
    })),
}));

// Mock EnvironmentApiService
jest.mock('../../services/EnvironmentApiService', () => ({
    EnvironmentApiService: {
        create: jest.fn().mockImplementation(() => ({
            getProjectById: jest.fn().mockResolvedValue(mockProject),
            getProjectDocument: jest.fn().mockResolvedValue({ data: '{"test": "document"}' }),
            saveProjectDocument: jest.fn().mockResolvedValue({ success: true }),
            getAllUserInterfaces: jest.fn().mockResolvedValue({ data: [mockUserInterface] }),
            getUserInterfaceById: jest.fn().mockResolvedValue(mockUserInterface),
            getOutputSettings: jest.fn().mockResolvedValue({ data: [mockOutputSetting] }),
            getAllConnectors: jest.fn().mockResolvedValue({ data: [] }),
            getConnectorById: jest.fn().mockResolvedValue({ parsedData: { source: { url: connectorSourceUrl } } }),
            getConnectorByIdAs: jest.fn().mockResolvedValue({ parsedData: { source: { url: connectorSourceUrl } } }),
            getOutputSettingsById: jest.fn().mockResolvedValue({}),
            getTaskStatus: jest.fn().mockResolvedValue({}),
            generateOutput: jest.fn().mockResolvedValue({}),
            getTokenService: jest.fn().mockReturnValue({
                getToken: jest.fn().mockReturnValue('mock-token'),
                refreshToken: jest.fn().mockResolvedValue('new-token'),
            }),
        })),
    },
}));

describe('StudioLoader integration - no projectId', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should not try to load project details when there is no projectId provided in the config', async () => {
        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioUILoaderConfig({
                selector: 'sui-root',
                projectDownloadUrl, // Keep this to test ProjectDataClient path
                projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
                graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
                authToken: token,
                projectName,
                refreshTokenAction: () => Promise.resolve(''),
            });
        });

        await waitFor(() => {
            expect(screen.getByText(projectName)).toBeInTheDocument();
        });
    });

    it('Should not try to load project document when there is no projectId provided or projectDownloadUrl in the config', async () => {
        const config = {
            selector: 'sui-root',
            projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
            graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
            authToken: token,
            projectName,
            refreshTokenAction: () => Promise.resolve(''),
        };

        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        await waitFor(() => {
            expect(screen.getByText(projectName)).toBeInTheDocument();
        });
    });
});

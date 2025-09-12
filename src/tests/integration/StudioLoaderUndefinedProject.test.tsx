import { connectorSourceUrl } from '@tests/mocks/sdk.mock';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { act, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

import StudioUI from '../../main';

const environmentBaseURL = 'environmentBaseURL';
const projectID = 'projectId';
const projectName = 'projectName';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const token = 'auth-token';

jest.mock('axios');

// Mock environment client API
jest.mock('@chili-publish/environment-client-api', () => ({
    ConnectorsApi: jest.fn().mockImplementation(() => ({
        getById: jest.fn().mockResolvedValue({ parsedData: { source: { url: connectorSourceUrl } } }),
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

describe('StudioLoader integration - no projectId', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should not try to load project details when there is no projectId provided in the config', async () => {
        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioUILoaderConfig({
                selector: 'sui-root',
                projectDownloadUrl, // Keep this to test axios path
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
        expect(axios.get).not.toHaveBeenCalledWith(`${environmentBaseURL}/projects/undefined`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        expect(axios.get).toHaveBeenCalledWith(projectDownloadUrl, {
            headers: { Authorization: `Bearer ${token}` },
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
        expect(axios.get).not.toHaveBeenCalledWith(`${environmentBaseURL}/projects/undefined`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        expect(axios.get).not.toHaveBeenCalledWith(projectDownloadUrl, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const documentFallbackUrl = `${environmentBaseURL}/projects/undefined/document`;
        expect(axios.get).not.toHaveBeenCalledWith(documentFallbackUrl, {
            headers: { Authorization: `Bearer ${token}` },
        });
    });
});

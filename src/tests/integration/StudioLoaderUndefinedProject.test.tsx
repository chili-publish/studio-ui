import { connectorSourceUrl } from '@tests/shared.util/sdk.mock';
import axios from 'axios';
import { act, render, screen, waitFor } from '@testing-library/react';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';

import StudioUI from '../../main';

const environmentBaseURL = 'environmentBaseURL';
const projectID = 'projectId';
const projectName = 'projectName';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const projectInfoUrl = `${environmentBaseURL}/projects/${projectID}`;
const token = 'auth-token';

jest.mock('axios');

describe('StudioLoader integration - no projectId', () => {
    beforeAll(() => {
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url === `${environmentBaseURL}/user-interfaces`)
                return Promise.resolve({ status: 200, data: { data: [mockUserInterface] } });
            if (url === `${environmentBaseURL}/output/settings`)
                return Promise.resolve({ status: 200, data: { data: [mockOutputSetting] } });
            if (url === projectDownloadUrl) return Promise.resolve({ data: {} });
            if (url === projectInfoUrl) return Promise.resolve({ data: mockProject });
            if (url === connectorSourceUrl) return Promise.resolve({ data: {} });

            return Promise.resolve({ data: {} });
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should not try to load project details when there is no projectId provided in the config', async () => {
        const config = {
            selector: 'sui-root',
            projectDownloadUrl,
            projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
            graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
            authToken: token,
            projectName,
            refreshTokenAction: () => Promise.resolve(''),
        };

        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioLoaderConfig(config);
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
            StudioUI.studioLoaderConfig(config);
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

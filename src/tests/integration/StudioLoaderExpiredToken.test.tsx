import '@tests/shared.util/sdk.mock';
import { connectorSourceUrl } from '@tests/shared.util/sdk.mock';
import StudioUI from '../../main';
import { act, render, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const projectName = 'projectName';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const projectInfoUrl = `${environmentBaseURL}/projects/${projectID}`;
const outputSettingsurl = `${environmentBaseURL}/output/settings`;
const token = 'auth-token';
const refreshToken = 'refresh-token';

jest.mock('axios');

describe('StudioLoader integration - expired auth token with provided refreshToken action', () => {
    it('Should correctly refresh the token', async () => {
        let onError: any;

        (axios.interceptors.response.use as jest.Mock).mockImplementation((_, onRejected) => {
            onError = onRejected;
        });

        (axios.get as jest.Mock).mockImplementation((url, params) => {
            // trigger auth token expired for project info endpoint, which will be handled by the axios interceptor
            if (url === outputSettingsurl && params?.headers?.Authorization === `Bearer ${token}`) {
                onError?.({
                    url: url,
                    config: {
                        retry: false,
                        headers: {},
                    },
                    response: {
                        status: 401,
                    },
                });
                return Promise.resolve({
                    data: {
                        data: [],
                    },
                });
            }
            if (url === `${environmentBaseURL}/user-interfaces`)
                return Promise.resolve({ status: 200, data: { data: [mockUserInterface] } });
            if (url === outputSettingsurl) return Promise.resolve({ status: 200, data: { data: [mockOutputSetting] } });
            if (url === projectDownloadUrl) return Promise.resolve({ data: {} });
            if (url === connectorSourceUrl) return Promise.resolve({ data: {} });
            if (url === projectInfoUrl) return Promise.resolve({ data: mockProject });

            return Promise.resolve({});
        });

        const refreshTokenFn = jest.fn().mockResolvedValue(refreshToken);
        const config = {
            selector: 'sui-root',
            projectDownloadUrl,
            projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
            projectId: projectID,
            graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
            authToken: token,
            projectName: '',
            refreshTokenAction: refreshTokenFn,
        };

        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioLoaderConfig(config);
        });

        await waitFor(() => {
            expect(refreshTokenFn).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(`${environmentBaseURL}/output/settings`, {
                headers: { Authorization: `Bearer ${refreshToken}` },
            });
        });
    });
});

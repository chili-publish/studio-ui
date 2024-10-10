import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { act, render, waitFor } from '@testing-library/react';
import { connectorSourceUrl } from '@tests/shared.util/sdk.mock';
import axios from 'axios';
import StudioUI from '../../main';

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const projectInfoUrl = `${environmentBaseURL}/projects/${projectID}`;
const outputSettingsurl = `${environmentBaseURL}/output/settings`;
const token = 'auth-token';
const refreshTokenData = 'refresh-token-data';

jest.mock('axios');
describe('StudioLoader integration - expired auth token', () => {
    it('Should correctly refresh the token when refreshToken action is provided', async () => {
        let onError: jest.Func;

        (axios.interceptors.response.use as jest.Mock).mockImplementation((_, onRejected) => {
            onError = jest.fn().mockImplementation((config) => {
                onRejected?.(config);
            });
        });

        (axios.get as jest.Mock).mockImplementation((url, params) => {
            // trigger auth token expired, which will be handled by the axios interceptor
            if (params?.headers?.Authorization === `Bearer ${token}`) {
                onError?.({
                    url,
                    config: {
                        retry: false,
                        headers: {},
                    },
                    response: {
                        status: 401,
                    },
                });
                return Promise.resolve({
                    status: 200,
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

        const refreshTokenFn = jest.fn().mockResolvedValue(refreshTokenData);
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
            expect(axios.get).toHaveBeenCalledWith(outputSettingsurl, {
                headers: { Authorization: `Bearer ${refreshTokenData}` },
            });
        });

        await waitFor(() => {
            expect(refreshTokenFn).toHaveBeenCalled();
        });
    });

    it('Should throw error when refreshToken action is not provided', async () => {
        let onError: jest.Func;

        (axios.interceptors.response.use as jest.Mock).mockImplementation((_, onRejected) => {
            onError = jest.fn().mockImplementation((config) => {
                onRejected?.(config);
            });
        });

        (axios.get as jest.Mock).mockImplementation((url, params) => {
            // trigger auth token expired, which will be handled by the axios interceptor
            if (params?.headers?.Authorization === `Bearer ${token}`) {
                onError?.({
                    url,
                    config: {
                        retry: false,
                        headers: {},
                    },
                    response: {
                        status: 401,
                    },
                });
                return Promise.resolve({
                    status: 200,
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

        const config = {
            selector: 'sui-root',
            projectDownloadUrl,
            projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
            projectId: projectID,
            graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
            authToken: token,
            projectName: '',
        };

        render(<div id="sui-root" />);
        act(() => {
            StudioUI.studioLoaderConfig(config);
        });

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => null);
        await waitFor(() =>
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[App] Axios error',
                expect.objectContaining(
                    new Error(
                        'The authentication token has expired, and a method to obtain a new one is not provided.',
                    ),
                ),
            ),
        );
        /* await waitFor(() =>
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[MainContent] Error',
                expect.objectContaining(new Error('Project not found.')),
            ),
        ); */
    });
});

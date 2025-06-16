import { connectorSourceUrl } from '@tests/mocks/sdk.mock';
import { LayoutIntent, LayoutPropertiesType } from '@chili-publish/studio-sdk';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { act, render, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import StudioUI from '../../main';
import userEvent from '@testing-library/user-event';
import { getDataTestIdForSUI } from 'src/utils/dataIds';
import selectEvent from 'react-select-event';

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const projectInfoUrl = `${environmentBaseURL}/projects/${projectID}`;
const outputSettingsurl = `${environmentBaseURL}/output/settings`;
const token = 'auth-token';
const refreshTokenData = 'refresh-token-data';

jest.mock('axios');
describe('StudioLoader integration - expired auth token', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

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
            if (url === `${environmentBaseURL}/user-interfaces/${mockUserInterface.id}`)
                return Promise.resolve({ status: 200, data: mockUserInterface });
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
        await act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        act(() => {
            window.StudioUISDK.config.events.onSelectedLayoutPropertiesChanged.trigger({
                intent: { value: LayoutIntent.digitalAnimated },
                timelineLengthMs: { value: 0 },
            } as unknown as LayoutPropertiesType);
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
            if (url === `${environmentBaseURL}/user-interfaces/${mockUserInterface.id}`)
                return Promise.resolve({ status: 200, data: mockUserInterface });
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
        await act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        act(() => {
            window.StudioUISDK.config.events.onSelectedLayoutPropertiesChanged.trigger({
                intent: { value: LayoutIntent.digitalAnimated },
                timelineLengthMs: { value: 0 },
            } as unknown as LayoutPropertiesType);
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

    it('Should retry polling with refreshed token if the first polling call fails due to expired token', async () => {
        let onError: jest.Func;

        (axios.interceptors.response.use as jest.Mock).mockImplementation((_, onRejected) => {
            onError = jest.fn().mockImplementation(async (config) => {
                await onRejected?.(config);
            });
        });

        const user = userEvent.setup();

        // Mock export POST to return polling link
        const pollingUrl = `${environmentBaseURL}/output/task/123`;
        (axios.post as jest.Mock).mockResolvedValueOnce({
            data: {
                links: { taskInfo: pollingUrl },
            },
        });

        (axios.get as jest.Mock).mockImplementation((url, config) => {
            if (url === pollingUrl) {
                if (config.headers.Authorization === `Bearer ${token}`) {
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
                    return Promise.resolve({ status: 202 });
                }
                // This condition guarantees that the polling call will be made with the refreshed token
                // and only in this situation download link will be returned
                if (config.headers.Authorization === `Bearer ${refreshTokenData}`) {
                    return Promise.resolve({ status: 200, data: { links: { download: 'http://download.com' } } });
                }
            }
            // Fallback for other GETs
            if (url === `${environmentBaseURL}/user-interfaces`)
                return Promise.resolve({ status: 200, data: { data: [mockUserInterface] } });
            if (url === `${environmentBaseURL}/user-interfaces/${mockUserInterface.id}`)
                return Promise.resolve({ status: 200, data: mockUserInterface });
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

        // Wait for initial render and config
        await act(() => {
            StudioUI.studioUILoaderConfig(config);
        });

        act(() => {
            window.StudioUISDK.config.events.onSelectedLayoutPropertiesChanged.trigger({
                intent: { value: LayoutIntent.digitalAnimated },
                timelineLengthMs: { value: 0 },
            } as unknown as LayoutPropertiesType);
        });

        // Wait for the download button to be ready
        const downloadBtn = await waitFor(() => screen.getByRole('button', { name: 'Download' }));
        user.click(downloadBtn);

        // Wait for the dropdown to be ready
        const selectIndicator = await waitFor(
            () =>
                screen
                    .getByTestId(getDataTestIdForSUI(`output-dropdown`))
                    .getElementsByClassName('grafx-select__dropdown-indicator')[0],
        );
        expect(selectIndicator).toBeInTheDocument();

        // Open the dropdown and select JPG
        await act(() => {
            selectEvent.openMenu(selectIndicator as unknown as HTMLElement);
        });

        const jpgOptions = await waitFor(() => screen.getAllByText(/jpg/i));
        user.click(jpgOptions[0]);

        // Wait for and click the download button
        const panelDownloadButton = await waitFor(() => screen.getByTestId(getDataTestIdForSUI(`download-btn`)));
        expect(panelDownloadButton).toBeInTheDocument();
        user.click(panelDownloadButton);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(pollingUrl, {
                method: 'GET',
                body: null,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
        });

        // Reset the timer to trigger the polling call with the refreshed token
        await act(() => jest.runOnlyPendingTimers());

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(pollingUrl, {
                method: 'GET',
                body: null,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refreshTokenData}` },
            });
        });

        // Assert refreshTokenFn was called
        expect(refreshTokenFn).toHaveBeenCalled();
    });
});

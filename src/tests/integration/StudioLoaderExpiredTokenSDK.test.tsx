/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectorSourceUrl } from '@tests/shared.util/sdk.mock';
import { act, render, waitFor } from '@testing-library/react';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import axios from 'axios';
import { GrafxTokenAuthCredentials } from '@chili-publish/studio-sdk';
import StudioUI from '../../main';

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const projectInfoUrl = `${environmentBaseURL}/projects/${projectID}`;
const outputSettingsurl = `${environmentBaseURL}/output/settings`;
const token = 'auth-token';
const refreshToken = 'refresh-token';

jest.mock('axios');

describe('StudioLoader integration - SDK expired auth token', () => {
    beforeEach(() => {
        (axios.get as jest.Mock).mockImplementation((url) => {
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
    });
    it('Should correctly refresh the token when refreshToken action is provided', async () => {
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
            StudioUI.studioUILoaderConfig(config);
        });

        let authResult: string;
        await act(async () => {
            authResult = await (window.StudioUISDK as any).subscriber.onAuthExpired('{"type":"grafxToken"}');
        });

        await waitFor(() => {
            expect(refreshTokenFn).toHaveBeenCalled();
            expect(JSON.parse(authResult)).toEqual(
                expect.objectContaining(new GrafxTokenAuthCredentials(refreshToken)),
            );
        });
    });

    it('Should correctly refresh the token when refreshToken action is not provided', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => null);

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
            StudioUI.studioUILoaderConfig(config);
        });

        let authResult: string;
        await act(async () => {
            authResult = await (window.StudioUISDK as any).subscriber.onAuthExpired('{"type":"grafxToken"}');
        });

        await waitFor(() =>
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.objectContaining(
                    new Error(
                        'The authentication token has expired, and a method to obtain a new one is not provided.',
                    ),
                ),
            ),
        );
        await waitFor(() => {
            expect(authResult).toEqual(null);
        });
    });
});

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
    it('Should correctly refresh the token when refreshToken action is provided', async () => {
        (axios.get as jest.Mock).mockImplementation((url) => {
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

        let authResult: string;
        await act(async () => {
            authResult = await (window.SDK as any).subscriber.onAuthExpired('{"type":"grafxToken"}');
        });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(outputSettingsurl, {
                headers: { Authorization: `Bearer ${refreshToken}` },
            });
        });

        await waitFor(() => {
            expect(refreshTokenFn).toHaveBeenCalled();
            expect(JSON.parse(authResult)).toEqual(
                expect.objectContaining(new GrafxTokenAuthCredentials(refreshToken)),
            );
        });
    });
});

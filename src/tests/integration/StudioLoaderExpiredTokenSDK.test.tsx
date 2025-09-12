/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectorSourceUrl } from '@tests/mocks/sdk.mock';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { act, render, waitFor } from '@testing-library/react';
import { GrafxTokenAuthCredentials } from '@chili-publish/studio-sdk';
import StudioUI from '../../main';

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

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const token = 'auth-token';
const refreshToken = 'refresh-token';

jest.mock('axios');

describe('StudioLoader integration - SDK expired auth token', () => {
    it('Should correctly refresh the token when refreshToken action is provided', async () => {
        const refreshTokenFn = jest.fn().mockResolvedValue(refreshToken);
        const config = {
            selector: 'sui-root',
            projectDownloadUrl, // Keep this to use axios path for now
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
            projectDownloadUrl, // Keep this to use axios path for now
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

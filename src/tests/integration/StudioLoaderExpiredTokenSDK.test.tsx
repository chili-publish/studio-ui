/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectorSourceUrl } from '@tests/mocks/sdk.mock';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { act, render, waitFor } from '@testing-library/react';
import { GrafxTokenAuthCredentials } from '@chili-publish/studio-sdk';
import StudioUI from '../../main';

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
        create: jest.fn().mockImplementation((_, __, refreshTokenAction) => ({
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
                refreshToken: jest.fn().mockImplementation(async () => {
                    if (refreshTokenAction) {
                        return refreshTokenAction();
                    }
                    throw new Error(
                        'The authentication token has expired, and a method to obtain a new one is not provided.',
                    );
                }),
            }),
            getEnvironment: jest.fn().mockReturnValue('test-environment'),
        })),
    },
}));

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const token = 'auth-token';
const refreshToken = 'refresh-token';

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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectorSourceUrl } from '@tests/mocks/sdk.mock';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { mockUserInterface } from '@mocks/mockUserinterface';
import { act, render, waitFor } from '@testing-library/react';
import { GrafxTokenAuthCredentials } from '@chili-publish/studio-sdk';
import StudioUI from '../../main';
import { TokenService } from '../../services/TokenService';
import { EnvironmentApiService } from '../../services/EnvironmentApiService';

// Mock TokenService singleton
jest.mock('../../services/TokenService', () => ({
    TokenService: {
        initialize: jest.fn(),
        getInstance: jest.fn(),
        reset: jest.fn(),
    },
}));

// Mock ProjectDataClient
jest.mock('../../services/ProjectDataClient', () => ({
    ProjectDataClient: jest.fn().mockImplementation(() => ({
        fetchFromUrl: jest.fn().mockResolvedValue('{"test": "document"}'),
        saveToUrl: jest.fn().mockResolvedValue(undefined),
    })),
}));

const environmentBaseURL = 'https://test-api.test.com/grafx/api/v1/environment/test-api';
const projectID = 'projectId';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const token = 'auth-token';
const refreshToken = 'refresh-token';

describe('StudioLoader integration - SDK expired auth token', () => {
    const mockTokenServiceInstance = {
        getToken: jest.fn().mockReturnValue('mock-token'),
        refreshToken: jest.fn(),
        updateEditorToken: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(() => {
        // Set up the mock instance
        (TokenService.getInstance as jest.Mock).mockReturnValue(mockTokenServiceInstance);
        // Mock the initialize method to store the refreshTokenAction
        (TokenService.initialize as jest.Mock).mockImplementation((_, refreshTokenAction) => {
            if (refreshTokenAction) {
                mockTokenServiceInstance.refreshToken.mockImplementation(async () => {
                    return refreshTokenAction();
                });
            }
        });
        // Set up EnvironmentApiService mock to return our mockTokenServiceInstance
        const mockEnvironmentApiService = {
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
        };
        (EnvironmentApiService.create as jest.Mock).mockReturnValue(mockEnvironmentApiService);
    });

    afterEach(() => {
        // Reset all mocks after each test
        jest.clearAllMocks();
    });

    it('Should correctly refresh the token when refreshToken action is provided', async () => {
        const refreshTokenFn = jest.fn().mockResolvedValue(refreshToken);
        const config = {
            selector: 'sui-root',
            projectDownloadUrl, // Keep this to use Project Data Client
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
            expect(mockTokenServiceInstance.refreshToken).toHaveBeenCalled();
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
            projectDownloadUrl, // Keep this to use Project Data Client
            projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
            projectId: projectID,
            graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
            authToken: token,
            projectName: '',
        };

        // Set up the mock to throw an error when refreshToken is called
        mockTokenServiceInstance.refreshToken.mockImplementation(async () => {
            throw new Error('The authentication token has expired, and a method to obtain a new one is not provided.');
        });

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

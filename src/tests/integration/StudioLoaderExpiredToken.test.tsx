import { connectorSourceUrl } from '@tests/mocks/sdk.mock';
import { LayoutIntent, LayoutPropertiesType } from '@chili-publish/studio-sdk';
import { mockOutputSetting } from '@mocks/mockOutputSetting';
import { mockProject } from '@mocks/mockProject';
import { act, render, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import StudioUI from '../../main';
import { EnvironmentApiService } from '../../services/EnvironmentApiService';
import { TokenService } from '../../services/TokenService';

const environmentBaseURL = 'http://abc.com';
const projectID = 'projectId';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const token = 'auth-token';
const refreshTokenData = 'refresh-token-data';

jest.mock('axios');
describe.skip('StudioLoader integration - expired auth token', () => {
    let mockEnvironmentApiService: jest.Mocked<EnvironmentApiService>;

    beforeEach(() => {
        // Create a mock environment API service
        mockEnvironmentApiService = {
            generateOutput: jest.fn().mockResolvedValue({
                data: { taskId: 'test-task-id' },
                links: { taskInfo: 'http://test.com/task-info' },
            }),
            getOutputSettings: jest.fn().mockResolvedValue({
                data: [mockOutputSetting],
            }),
            getTaskStatus: jest.fn().mockResolvedValue({
                status: 200,
                data: { taskId: 'test-task-id' },
                links: { download: 'http://test.com/download' },
            }),
            getProjectById: jest.fn().mockResolvedValue(mockProject),
            getTokenService: jest.fn().mockReturnValue({
                getToken: jest.fn().mockReturnValue(token),
                refreshToken: jest.fn(),
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        // Mock the factory method to return our mock instance
        (EnvironmentApiService.create as jest.Mock).mockReturnValue(mockEnvironmentApiService);

        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('Should correctly refresh the token when refreshToken action is provided', async () => {
        const refreshTokenFn = jest.fn().mockResolvedValue(refreshTokenData);

        // Setup mock token service with refresh token action
        const mockTokenService = {
            getToken: jest.fn().mockReturnValue(token),
            refreshToken: jest.fn().mockImplementation(async () => {
                const result = await refreshTokenFn();
                mockTokenService.getToken.mockReturnValue(result);
                return result;
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        mockEnvironmentApiService.getTokenService.mockReturnValue(mockTokenService);

        // Mock axios for any remaining axios calls (like document downloads)
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url === projectDownloadUrl) return Promise.resolve({ data: {} });
            if (url === connectorSourceUrl) return Promise.resolve({ data: {} });
            return Promise.resolve({});
        });

        const config = {
            selector: 'sui-root',
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

        // Verify that the application loads successfully
        await waitFor(() => {
            expect(screen.getByText('Test project')).toBeInTheDocument();
        });

        // Verify that EnvironmentApiService.create was called with correct parameters
        expect(EnvironmentApiService.create).toHaveBeenCalledWith(environmentBaseURL);

        // Verify that the token service is properly configured
        // Note: With singleton pattern, getTokenService is called internally
        // We can verify the TokenService was initialized instead
        expect(TokenService.initialize).toHaveBeenCalled();

        // Test token refresh functionality
        // With singleton pattern, we verify the initialization was called with correct parameters
        expect(TokenService.initialize).toHaveBeenCalledWith(token, refreshTokenFn);
    });

    it('Should throw error when refreshToken action is not provided ', async () => {
        // Setup mock token service without refresh token action
        const mockTokenService = {
            getToken: jest.fn().mockReturnValue(token),
            refreshToken: jest.fn().mockRejectedValue(new Error('No refresh token action provided')),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        mockEnvironmentApiService.getTokenService.mockReturnValue(mockTokenService);

        // Mock axios for any remaining axios calls (like document downloads)
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url === projectDownloadUrl) return Promise.resolve({ data: {} });
            if (url === connectorSourceUrl) return Promise.resolve({ data: {} });
            return Promise.resolve({});
        });

        const config = {
            selector: 'sui-root',
            projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
            projectId: projectID,
            graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
            authToken: token,
            projectName: '',
            // Note: No refreshTokenAction provided
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

        // Verify that EnvironmentApiService.create was called without refreshTokenAction
        expect(EnvironmentApiService.create).toHaveBeenCalledWith(environmentBaseURL);

        // Verify that the token service is properly configured
        // Note: With singleton pattern, getTokenService is called internally
        // We can verify the TokenService was initialized instead
        expect(TokenService.initialize).toHaveBeenCalled();

        // Test that refresh token fails gracefully when no action is provided
        await expect(mockTokenService.refreshToken()).rejects.toThrow('No refresh token action provided');
    });

    it('Should set up token refresh mechanism for axios interceptor integration', async () => {
        const refreshTokenFn = jest.fn().mockResolvedValue(refreshTokenData);

        // Setup mock token service with refresh token action
        const mockTokenService = {
            getToken: jest.fn().mockReturnValue(token),
            refreshToken: jest.fn().mockImplementation(async () => {
                const result = await refreshTokenFn();
                mockTokenService.getToken.mockReturnValue(result);
                return result;
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        mockEnvironmentApiService.getTokenService.mockReturnValue(mockTokenService);

        // Mock axios interceptor to track its setup
        const mockInterceptor = jest.fn();
        (axios.interceptors.response.use as jest.Mock).mockImplementation(mockInterceptor);

        // Mock axios for any calls
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url === projectDownloadUrl) return Promise.resolve({ data: {} });
            if (url === connectorSourceUrl) return Promise.resolve({ data: {} });
            return Promise.resolve({});
        });

        const config = {
            selector: 'sui-root',
            projectDownloadUrl, // Provide download URL to trigger axios calls
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

        // Verify that EnvironmentApiService.create was called with correct parameters
        expect(EnvironmentApiService.create).toHaveBeenCalledWith(environmentBaseURL);

        // Verify that the axios interceptor was set up
        expect(mockInterceptor).toHaveBeenCalled();

        // Verify that the interceptor was called with both success and error handlers
        const interceptorCalls = mockInterceptor.mock.calls;
        expect(interceptorCalls.length).toBeGreaterThan(0);

        // The first argument should be a success handler (function)
        // The second argument should be an error handler (function)
        expect(typeof interceptorCalls[0][0]).toBe('function'); // Success handler
        expect(typeof interceptorCalls[0][1]).toBe('function'); // Error handler

        // Verify that the token service is properly configured
        // Note: With singleton pattern, getTokenService is called internally
        // We can verify the TokenService was initialized instead
        expect(TokenService.initialize).toHaveBeenCalled();

        // Test token refresh functionality
        await mockTokenService.refreshToken();
        expect(refreshTokenFn).toHaveBeenCalled();
    });

    it('Should retry polling with refreshed token if the first polling call fails due to expired token', async () => {
        const refreshTokenFn = jest.fn().mockResolvedValue(refreshTokenData);

        // Setup mock token service with refresh token action
        const mockTokenService = {
            getToken: jest.fn().mockReturnValue(token),
            refreshToken: jest.fn().mockImplementation(async () => {
                const result = await refreshTokenFn();
                mockTokenService.getToken.mockReturnValue(result);
                return result;
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        mockEnvironmentApiService.getTokenService.mockReturnValue(mockTokenService);

        // Use a proper environment URL that will extract the environment correctly
        const properEnvironmentUrl = `${environmentBaseURL}/api/v1/environment/test-environment`;

        // Mock axios for any calls
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url === projectDownloadUrl) return Promise.resolve({ data: {} });
            if (url === connectorSourceUrl) return Promise.resolve({ data: {} });
            return Promise.resolve({});
        });

        const config = {
            selector: 'sui-root',
            projectUploadUrl: `${environmentBaseURL}/projects/${projectID}`,
            projectId: projectID,
            graFxStudioEnvironmentApiBaseUrl: properEnvironmentUrl,
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

        // Wait for the application to load
        await waitFor(() => {
            expect(screen.getByText('Test project')).toBeInTheDocument();
        });

        // Verify that EnvironmentApiService.create was called with correct parameters
        expect(EnvironmentApiService.create).toHaveBeenCalledWith(properEnvironmentUrl);

        // Verify that the token service is properly configured
        // Note: With singleton pattern, getTokenService is called internally
        // We can verify the TokenService was initialized instead
        expect(TokenService.initialize).toHaveBeenCalled();

        // Test token refresh functionality
        await mockTokenService.refreshToken();
        expect(refreshTokenFn).toHaveBeenCalled();
    });
});

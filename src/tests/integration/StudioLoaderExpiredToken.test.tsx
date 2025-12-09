import '@tests/mocks/sdk.mock';

import { mockProject } from '@mocks/mockProject';
import { act, render, waitFor } from '@testing-library/react';
import StudioUI from '../../main';
// Unmock all services to use real implementations
jest.unmock('../../services/TokenService');
jest.unmock('../../services/EnvironmentApiService');
jest.unmock('../../services/ProjectDataClient');

const environmentBaseURL = 'https://test-api.test.com/grafx/api/v1/environment/test-api';
const projectID = 'projectId';
const projectDownloadUrl = `${environmentBaseURL}/projects/${projectID}/document`;
const originalToken = 'auth-token';
const newToken = 'refreshed-auth-token';

// Mock fetch globally to control HTTP responses
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('StudioLoader integration - expired auth token', () => {
    beforeEach(() => {
        // Reset fetch mock
        mockFetch.mockClear();
    });

    it('Should call refreshTokenAction and retry with new token when EnvironmentApiService encounters 401', async () => {
        const refreshTokenFn = jest.fn().mockImplementation(() => {
            return Promise.resolve(newToken);
        });

        // Track calls to the specific project API URL
        const projectApiUrl = `${environmentBaseURL}/projects/${projectID}`;
        let projectApiCallCount = 0;

        // Mock fetch to return 401 on first call for specific URL, then 200 on retry
        mockFetch.mockImplementation((url) => {
            // Track calls to the specific project API endpoint
            if (url === projectApiUrl) {
                projectApiCallCount += 1;

                if (projectApiCallCount === 1) {
                    const response = {
                        ok: false,
                        status: 401,
                        statusText: 'Unauthorized',
                        headers: new Map(),
                        json: () => Promise.resolve({}),
                        clone: () => response,
                    };
                    // First call returns 401 to trigger token refresh
                    return Promise.resolve(response);
                }
                const response = {
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    headers: new Map([['content-type', 'application/json']]),
                    json: () => Promise.resolve(mockProject),
                    clone: () => response,
                };
                // Subsequent calls return success
                return Promise.resolve(response);
            }

            // For other API calls, return success
            const response = {
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Map([['content-type', 'application/json']]),
                json: () => Promise.resolve({ data: [] }),
                clone: () => response,
            };
            return Promise.resolve(response);
        });

        const config = {
            selector: 'sui-root',
            projectId: projectID,
            graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
            authToken: originalToken,
            projectName: 'Test project',
            refreshTokenAction: refreshTokenFn,
        };

        render(<div id="sui-root" />);

        await act(async () => {
            StudioUI.studioUILoaderConfig(config);
        });

        // Wait for the refreshTokenAction to be called
        await waitFor(() => {
            expect(refreshTokenFn).toHaveBeenCalled();
        });

        // Check that the calls to the specific URL use the correct tokens
        const projectApiCalls = mockFetch.mock.calls.filter((call) => call[0] === projectApiUrl);
        expect(projectApiCalls.length).toBeGreaterThan(1);

        // First call should use original token
        const firstCall = projectApiCalls[0];
        const firstCallHeaders = firstCall[1]?.headers;
        expect(firstCallHeaders?.Authorization).toBe(`Bearer ${originalToken}`);

        const lastCall = projectApiCalls.at(-1);
        const lastCallHeaders = lastCall[1]?.headers;
        expect(lastCallHeaders?.Authorization).toBe(`Bearer ${newToken}`);
    });

    it('Should call refreshTokenAction and retry with new token when ProjectDataClient encounters 401', async () => {
        const refreshTokenFn = jest.fn().mockResolvedValue(newToken);

        // Track calls to the specific document URL
        let documentApiCallCount = 0;

        // Mock fetch to return 401 on first call for specific URL, then 200 on retry
        mockFetch.mockImplementation((url) => {
            // Track calls to the specific document endpoint
            if (url === projectDownloadUrl) {
                documentApiCallCount += 1;

                if (documentApiCallCount === 1) {
                    const response = {
                        ok: false,
                        status: 401,
                        statusText: 'Unauthorized',
                        clone: () => response,
                    };
                    // First call returns 401 to trigger token refresh
                    return Promise.resolve(response);
                }
                const response = {
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ data: '{"test": "document"}' }),
                    headers: new Map([['content-type', 'application/json']]),
                    clone: () => response,
                };
                // Subsequent calls return success
                return Promise.resolve(response);
            }

            const response = {
                ok: true,
                status: 200,
                json: () => Promise.resolve({ data: [] }),
                clone: () => response,
            };
            return Promise.resolve(response);
        });

        const config = {
            selector: 'sui-root',
            projectDownloadUrl, // Provide download URL to trigger ProjectDataClient calls
            projectId: projectID,
            graFxStudioEnvironmentApiBaseUrl: environmentBaseURL,
            authToken: originalToken,
            projectName: '',
            refreshTokenAction: refreshTokenFn,
        };

        render(<div id="sui-root" />);

        await act(async () => {
            StudioUI.studioUILoaderConfig(config);
        });

        // Wait for the refreshTokenAction to be called
        await waitFor(() => {
            expect(refreshTokenFn).toHaveBeenCalled();
        });

        // Verify that the specific document URL was called at least twice (401 then retry with new token)
        expect(documentApiCallCount).toBeGreaterThanOrEqual(2);

        // Check that the calls to the specific URL use the correct tokens
        const documentApiCalls = mockFetch.mock.calls.filter((call) => call[0] === projectDownloadUrl);
        expect(documentApiCalls.length).toBeGreaterThanOrEqual(2);

        // First call should use original token
        const firstCall = documentApiCalls[0];
        const firstCallHeaders = firstCall[1]?.headers;
        expect(firstCallHeaders?.Authorization).toBe(`Bearer ${originalToken}`);

        // At least one subsequent call should use new token
        const hasNewTokenCall = documentApiCalls.some((call, index) => {
            if (index === 0) return false; // Skip first call
            const headers = call[1]?.headers;
            return headers?.Authorization === `Bearer ${newToken}`;
        });
        expect(hasNewTokenCall).toBe(true);
    });
});

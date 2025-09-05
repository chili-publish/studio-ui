import { WellKnownConfigurationKeys } from '@chili-publish/studio-sdk';
import axios, { AxiosError } from 'axios';
import { mockProject } from '@mocks/mockProject';
import { mockApiUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting, mockOutputSetting2 } from '@mocks/mockOutputSetting';
import { StudioProjectLoader } from '../StudioProjectLoader';
import { createMockEnvironmentClientApis } from './mocks/environmentClientApi';

jest.mock('axios');

// Mock environment client API
jest.mock('@chili-publish/environment-client-api', () => ({
    ConnectorsApi: jest.fn().mockImplementation(() => ({})),
    ProjectsApi: jest.fn().mockImplementation(() => ({
        apiV1EnvironmentEnvironmentProjectsProjectIdGet: jest.fn().mockResolvedValue(mockProject),
        apiV1EnvironmentEnvironmentProjectsProjectIdDocumentGet: jest
            .fn()
            .mockResolvedValue({ data: '{"test": "document"}' }),
        apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut: jest.fn().mockResolvedValue({ success: true }),
    })),
    UserInterfacesApi: jest.fn().mockImplementation(() => ({
        apiV1EnvironmentEnvironmentUserInterfacesGet: jest.fn().mockResolvedValue({ data: [mockApiUserInterface] }),
        apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet: jest.fn().mockResolvedValue(mockApiUserInterface),
    })),
    SettingsApi: jest.fn().mockImplementation(() => ({})),
    OutputApi: jest.fn().mockImplementation(() => ({
        apiV1EnvironmentEnvironmentOutputSettingsGet: jest
            .fn()
            .mockResolvedValue({ data: [mockOutputSetting, mockOutputSetting2] }),
    })),
    Configuration: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../utils/documentExportHelper', () => ({
    getDownloadLink: jest.fn().mockReturnValue({
        status: 200,
        error: undefined,
        success: true,
        parsedData: { url: 'mockUrl' },
        data: JSON.stringify({ url: 'mockUrl' }),
    }),
    addTrailingSlash: jest.fn().mockReturnValue('mockGraFxStudioEnvironmentApiBaseUrl/'),
}));

describe('StudioProjectLoader', () => {
    const mockProjectId = 'mockProjectId';
    const mockGraFxStudioEnvironmentApiBaseUrl = 'mockGraFxStudioEnvironmentApiBaseUrl/';
    const mockAuthToken = 'mockAuthToken';
    const mockRefreshTokenAction = jest.fn();
    const mockProjectDownloadUrl = 'mockProjectDownloadUrl';
    const mockProjectUploadUrl = 'mockProjectUploadUrl';
    const mockDocument = { data: { mock: 'data' } };
    const mockGenerateJson = jest.fn().mockResolvedValue(Promise.resolve(JSON.stringify(mockDocument)));

    // Mock environment client APIs
    const mockEnvironmentClientApis = createMockEnvironmentClientApis();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('onProjectInfoRequested', () => {
        it('should fetch project info and cache it', async () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onProjectInfoRequested();

            expect(result).toEqual(mockProject);
            // Verify that the environment client API method was called
            expect(
                mockEnvironmentClientApis.projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdGet,
            ).toHaveBeenCalledWith({
                environment: 'test-environment',
                projectId: mockProjectId,
            });
        });

        it('should throw an error if project is not found', async () => {
            // Create a new mock instance that returns null
            const mockProjectsApi = {
                apiV1EnvironmentEnvironmentProjectsProjectIdGet: jest.fn().mockResolvedValue(null),
                apiV1EnvironmentEnvironmentProjectsProjectIdDocumentGet: jest
                    .fn()
                    .mockResolvedValue({ data: '{"test": "document"}' }),
                apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut: jest.fn().mockResolvedValue({ success: true }),
            };
            const mockEnvironmentClientApisWithNull = {
                ...mockEnvironmentClientApis,
                projectsApi: mockProjectsApi,
            };

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                mockEnvironmentClientApisWithNull as any,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            await expect(loader.onProjectInfoRequested()).rejects.toThrow('Project not found');
        });
    });

    describe('onProjectDocumentRequested', () => {
        it('should fetch project template using fallback URL if download URL is not provided', async () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                undefined,
                mockProjectUploadUrl,
            );

            const result = await loader.onProjectDocumentRequested();

            expect(result).toEqual('{"data":"{\\"test\\": \\"document\\"}"}');
            // Verify that the environment client API method was called
            expect(
                mockEnvironmentClientApis.projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdDocumentGet,
            ).toHaveBeenCalledWith({
                environment: 'test-environment',
                projectId: mockProjectId,
            });
        });

        it('should fetch project template using download URL', async () => {
            (axios.get as jest.Mock).mockResolvedValueOnce(mockDocument);
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onProjectDocumentRequested();

            expect(result).toEqual(JSON.stringify(mockDocument.data));
            expect(axios.get).toHaveBeenCalledWith(mockProjectDownloadUrl, {
                headers: { Authorization: 'Bearer mockAuthToken' },
            });
        });

        it('should return "null" in case of error', async () => {
            (axios.get as jest.Mock).mockRejectedValueOnce({});
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onProjectDocumentRequested();

            expect(result).toBeNull();
            expect(axios.get).toHaveBeenCalledWith(mockProjectDownloadUrl, {
                headers: { Authorization: 'Bearer mockAuthToken' },
            });
        });
    });

    describe('onEngineInitialized', () => {
        it('should set GraFxStudioEnvironmentApiUrl configuration value', () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );
            window.StudioUISDK.configuration.setValue = jest.fn();

            loader.onEngineInitialized();

            expect(window.StudioUISDK.configuration.setValue).toHaveBeenCalledWith(
                WellKnownConfigurationKeys.GraFxStudioEnvironmentApiUrl,
                mockGraFxStudioEnvironmentApiBaseUrl,
            );
        });
    });

    describe('onProjectSave', () => {
        it('should save document and return project info', async () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );
            loader.onProjectInfoRequested = jest.fn().mockResolvedValue(mockProject);

            const result = await loader.onProjectSave(mockGenerateJson);

            // Verify that the environment client API method was called
            expect(
                mockEnvironmentClientApis.projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut,
            ).toHaveBeenCalled();
            expect(result).toEqual(mockProject);
            expect(loader.onProjectInfoRequested).toHaveBeenCalled();
        });

        it('Should use fallback url to save document when document URL is not provided', async () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                undefined,
                mockProjectUploadUrl,
            );
            loader.onProjectInfoRequested = jest.fn().mockResolvedValue(mockProject);

            const result = await loader.onProjectSave(mockGenerateJson);

            expect(result).toEqual(mockProject);
            expect(loader.onProjectInfoRequested).toHaveBeenCalled();
            // Verify that the environment client API method was called
            expect(
                mockEnvironmentClientApis.projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut,
            ).toHaveBeenCalled();
        });
    });

    describe('onAuthenticationRequested', () => {
        it('should return auth token', () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = loader.onAuthenticationRequested();

            expect(result).toEqual(mockAuthToken);
        });
    });

    describe('onAuthenticationExpired', () => {
        it('should refresh token and return new token', async () => {
            const mockNewToken = 'mockNewToken';
            mockRefreshTokenAction.mockResolvedValueOnce(mockNewToken);
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onAuthenticationExpired();

            expect(result).toEqual(mockNewToken);
            expect(mockRefreshTokenAction).toHaveBeenCalled();
        });

        it('should throw error if token refresh fails', async () => {
            const mockError = new Error('mockError') as AxiosError;
            mockRefreshTokenAction.mockResolvedValueOnce(mockError);
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            await expect(loader.onAuthenticationExpired()).rejects.toEqual(mockError);
        });

        it('should throw error if refresh token is not provided', async () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                undefined,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            await expect(loader.onAuthenticationExpired()).rejects.toEqual(
                new Error('The authentication token has expired, and a method to obtain a new one is not provided.'),
            );
        });
    });

    describe('onLogInfoRequested', () => {
        it('should return log info', () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = loader.onLogInfoRequested();

            expect(result).toEqual({
                projectDownloadUrl: mockProjectDownloadUrl,
                projectUploadUrl: mockProjectUploadUrl,
                projectId: mockProjectId,
                graFxStudioEnvironmentApiBaseUrl: mockGraFxStudioEnvironmentApiBaseUrl,
            });
        });
    });

    describe('onProjectGetDownloadLink', () => {
        it('should get download link', async () => {
            const mockExtension = 'pdf';
            const mockSelectedLayoutID = 'mockSelectedLayoutID';
            const mockOutputSettingsId = 'mockOutputSettingsId';
            const mockDownloadLinkResult = {
                status: 200,
                error: undefined,
                success: true,
                parsedData: { url: 'mockUrl' },
                data: JSON.stringify({ url: 'mockUrl' }),
            };
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onProjectGetDownloadLink(
                mockExtension,
                mockSelectedLayoutID,
                mockOutputSettingsId,
            );

            expect(result).toEqual(mockDownloadLinkResult);
        });
    });

    describe('onFetchStudioUserInterfaceDetails', () => {
        beforeEach(() => {
            // Clear sessionStorage before each test
            sessionStorage.clear();
        });

        it('should call endpoint for "default" user interface with correct params in sandbox mode', async () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                true, // sandbox mode
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onFetchStudioUserInterfaceDetails();

            // Verify that the environment client API methods were called
            expect(
                mockEnvironmentClientApis.outputApi.apiV1EnvironmentEnvironmentOutputSettingsGet,
            ).toHaveBeenCalledWith({
                environment: 'test-environment',
            });
            expect(
                mockEnvironmentClientApis.userInterfacesApi.apiV1EnvironmentEnvironmentUserInterfacesGet,
            ).toHaveBeenCalledWith({
                environment: 'test-environment',
            });
            expect(result).toEqual({
                userInterface: { id: mockApiUserInterface.id, name: mockApiUserInterface.name },
                outputSettings: expect.any(Array), // The outputSettings are processed and may have additional properties
                formBuilder: expect.any(Object), // The formBuilder is transformed from JSON string to object
                outputSettingsFullList: expect.any(Array), // The outputSettingsFullList are processed and may have additional properties
            });
        });

        it('should call endpoint for "userInterfaceId" user interface with correct params', async () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
                '1234',
            );

            const result = await loader.onFetchStudioUserInterfaceDetails();

            // Verify that the environment client API methods were called
            expect(
                mockEnvironmentClientApis.outputApi.apiV1EnvironmentEnvironmentOutputSettingsGet,
            ).toHaveBeenCalledWith({
                environment: 'test-environment',
            });
            expect(
                mockEnvironmentClientApis.userInterfacesApi.apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet,
            ).toHaveBeenCalledWith({
                environment: 'test-environment',
                userInterfaceId: '1234',
            });
            expect(result).toEqual({
                userInterface: { id: mockApiUserInterface.id, name: mockApiUserInterface.name },
                outputSettings: expect.any(Array), // The outputSettings are processed and may have additional properties
                formBuilder: expect.any(Object), // The formBuilder is transformed from JSON string to object
                outputSettingsFullList: expect.any(Array), // The outputSettingsFullList are processed and may have additional properties
            });
        });

        it('should use sessionStorage userInterfaceId when no userInterfaceId is provided', async () => {
            // Set sessionStorage
            sessionStorage.setItem('userInterfaceId', 'session-id');

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onFetchStudioUserInterfaceDetails();

            // Verify that the environment client API methods were called
            expect(
                mockEnvironmentClientApis.outputApi.apiV1EnvironmentEnvironmentOutputSettingsGet,
            ).toHaveBeenCalledWith({
                environment: 'test-environment',
            });
            expect(
                mockEnvironmentClientApis.userInterfacesApi.apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet,
            ).toHaveBeenCalledWith({
                environment: 'test-environment',
                userInterfaceId: 'session-id',
            });
            expect(result).toEqual({
                userInterface: { id: mockApiUserInterface.id, name: mockApiUserInterface.name },
                outputSettings: expect.any(Array), // The outputSettings are processed and may have additional properties
                formBuilder: expect.any(Object), // The formBuilder is transformed from JSON string to object
                outputSettingsFullList: expect.any(Array), // The outputSettingsFullList are processed and may have additional properties
            });
        });

        it('should use custom onFetchUserInterfaceDetails callback when provided', async () => {
            const mockUserInterface = {
                id: 'custom-id',
                name: 'Custom UI',
                outputSettings: {},
                formBuilder: [],
            };

            const mockOnFetchUserInterfaceDetails = jest.fn().mockResolvedValue(mockUserInterface);

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
                'custom-id',
                mockOnFetchUserInterfaceDetails,
            );

            const result = await loader.onFetchStudioUserInterfaceDetails();

            expect(mockOnFetchUserInterfaceDetails).toHaveBeenCalledWith('custom-id');
            expect(result).toEqual({
                userInterface: { id: 'custom-id', name: 'Custom UI' },
                outputSettings: [],
                formBuilder: undefined,
                outputSettingsFullList: [mockOutputSetting, mockOutputSetting2],
            });
        });

        it('should return error when custom onFetchUserInterfaceDetails callback fails without fallback', async () => {
            const mockError = new Error('Custom callback failed');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mockError as any).response = {
                status: 404,
            };

            const mockOnFetchUserInterfaceDetails = jest.fn().mockRejectedValue(mockError);

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockEnvironmentClientApis,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
                'custom-id',
                mockOnFetchUserInterfaceDetails,
            );

            await expect(loader.onFetchStudioUserInterfaceDetails()).rejects.toThrow('Custom callback failed');

            expect(mockOnFetchUserInterfaceDetails).toHaveBeenCalledWith('custom-id');
            // Verify that only the output settings call was made
            expect(
                mockEnvironmentClientApis.outputApi.apiV1EnvironmentEnvironmentOutputSettingsGet,
            ).toHaveBeenCalledTimes(1);
        });

        it('should fallback to default user interface when 404 error occurs for built-in implementation', async () => {
            // Create a new mock instance that throws a 404 error for the specific user interface
            const mockUserInterfacesApi = {
                apiV1EnvironmentEnvironmentUserInterfacesGet: jest
                    .fn()
                    .mockResolvedValue({ data: [mockApiUserInterface] }),
                apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet: jest.fn().mockRejectedValue({
                    status: 404,
                }),
            };
            const mockEnvironmentClientApisWithError = {
                ...mockEnvironmentClientApis,
                userInterfacesApi: mockUserInterfacesApi,
            };

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                mockEnvironmentClientApisWithError as any,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
                'non-existent-id',
            );

            const result = await loader.onFetchStudioUserInterfaceDetails();

            // Verify that the environment client API methods were called
            expect(
                mockEnvironmentClientApisWithError.outputApi.apiV1EnvironmentEnvironmentOutputSettingsGet,
            ).toHaveBeenCalledWith({
                environment: 'test-environment',
            });
            expect(
                mockEnvironmentClientApisWithError.userInterfacesApi
                    .apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet,
            ).toHaveBeenCalledWith({
                environment: 'test-environment',
                userInterfaceId: 'non-existent-id',
            });
            // Should fallback to getting all user interfaces
            expect(
                mockEnvironmentClientApisWithError.userInterfacesApi.apiV1EnvironmentEnvironmentUserInterfacesGet,
            ).toHaveBeenCalledWith({
                environment: 'test-environment',
            });
            expect(result).toEqual({
                userInterface: { id: mockApiUserInterface.id, name: mockApiUserInterface.name },
                outputSettings: expect.any(Array), // The outputSettings are processed and may have additional properties
                formBuilder: expect.any(Object), // The formBuilder is transformed from JSON string to object
                outputSettingsFullList: expect.any(Array), // The outputSettingsFullList are processed and may have additional properties
            });
        });
    });
});

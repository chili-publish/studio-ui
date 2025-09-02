import { WellKnownConfigurationKeys } from '@chili-publish/studio-sdk';
import axios, { AxiosError } from 'axios';
import { StudioProjectLoader } from '../StudioProjectLoader';
import { Project } from '../types/types';

jest.mock('axios');

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
    const mockCachedProject: Project = { id: mockProjectId, name: 'mockProjectName', template: { id: 'dddddd' } };
    const mockDocument = { data: { mock: 'data' } };
    const mockGenerateJson = jest.fn().mockResolvedValue(Promise.resolve(JSON.stringify(mockDocument)));

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('onProjectInfoRequested', () => {
        it('should fetch project info and cache it', async () => {
            (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockCachedProject });
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onProjectInfoRequested();

            expect(result).toEqual(mockCachedProject);
            expect(axios.get).toHaveBeenCalledWith(
                `${mockGraFxStudioEnvironmentApiBaseUrl}/projects/${mockProjectId}`,
                {
                    headers: { Authorization: `Bearer ${mockAuthToken}` },
                },
            );
        });

        it('should throw an error if project is not found', async () => {
            (axios.get as jest.Mock).mockResolvedValueOnce({ data: null });
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            await expect(loader.onProjectInfoRequested()).rejects.toThrow('Project not found');
        });
    });

    describe('onProjectDocumentRequested', () => {
        it('should fetch project template using fallback URL if download URL is not provided', async () => {
            (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockDocument.data });
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockRefreshTokenAction,
                undefined,
                mockProjectUploadUrl,
            );

            const result = await loader.onProjectDocumentRequested();

            expect(result).toEqual(JSON.stringify(mockDocument.data));
            expect(axios.get).toHaveBeenCalledWith(
                `${mockGraFxStudioEnvironmentApiBaseUrl}/projects/${mockProjectId}/document`,
                { headers: { Authorization: 'Bearer mockAuthToken' } },
            );
        });

        it('should fetch project template using download URL', async () => {
            (axios.get as jest.Mock).mockResolvedValueOnce(mockDocument);
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
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
            (axios.put as jest.Mock).mockResolvedValueOnce({ data: mockCachedProject });
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );
            loader.onProjectInfoRequested = jest.fn().mockResolvedValue(mockCachedProject);

            const result = await loader.onProjectSave(mockGenerateJson);

            expect(axios.put).toHaveBeenCalled();
            expect(result).toEqual(mockCachedProject);
            expect(loader.onProjectInfoRequested).toHaveBeenCalled();
        });

        it('Should use fallback url to save document when document URL is not provided', async () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockRefreshTokenAction,
                undefined,
                undefined,
            );
            loader.onProjectInfoRequested = jest.fn().mockResolvedValue(mockCachedProject);

            const result = await loader.onProjectSave(mockGenerateJson);

            expect(result).toEqual(mockCachedProject);
            expect(loader.onProjectInfoRequested).toHaveBeenCalled();
            expect(axios.put).toHaveBeenCalled();
        });
    });

    describe('onAuthenticationRequested', () => {
        it('should return auth token', () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
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
            const mockOutputSettings = { data: { data: [] } };
            const mockUserInterfaces = {
                data: { data: [{ id: 'default-id', name: 'Default UI', default: true, outputSettings: {} }] },
                status: 200,
            };

            (axios.get as jest.Mock)
                .mockResolvedValueOnce(mockOutputSettings) // output settings request
                .mockResolvedValueOnce(mockUserInterfaces); // user interface request

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                true, // sandbox mode
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onFetchStudioUserInterfaceDetails();

            expect(axios.get).toHaveBeenCalledWith(`${mockGraFxStudioEnvironmentApiBaseUrl}/output/settings`, {
                headers: {
                    Authorization: `Bearer ${mockAuthToken}`,
                },
            });
            expect(axios.get).toHaveBeenCalledWith(`${mockGraFxStudioEnvironmentApiBaseUrl}/user-interfaces`, {
                headers: {
                    Authorization: `Bearer ${mockAuthToken}`,
                },
            });
            expect(result).toEqual({
                userInterface: { id: 'default-id', name: 'Default UI' },
                outputSettings: [],
                formBuilder: undefined,
                outputSettingsFullList: [],
            });
        });

        it('should call endpoint for "userInterfaceId" user interface with correct params', async () => {
            const mockOutputSettings = { data: { data: [] } };
            const mockUserInterface = {
                data: {
                    id: '1234',
                    name: 'Test UI',
                    outputSettings: {},
                    formBuilder: JSON.stringify([]),
                },
                status: 200,
            };

            (axios.get as jest.Mock)
                .mockResolvedValueOnce(mockOutputSettings) // output settings request
                .mockResolvedValueOnce(mockUserInterface); // user interface request

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
                '1234',
            );

            const result = await loader.onFetchStudioUserInterfaceDetails();

            expect(axios.get).toHaveBeenCalledWith(`${mockGraFxStudioEnvironmentApiBaseUrl}/output/settings`, {
                headers: {
                    Authorization: `Bearer ${mockAuthToken}`,
                },
            });
            expect(axios.get).toHaveBeenCalledWith(`${mockGraFxStudioEnvironmentApiBaseUrl}/user-interfaces/1234`, {
                headers: {
                    Authorization: `Bearer ${mockAuthToken}`,
                },
            });
            expect(result).toEqual({
                userInterface: { id: '1234', name: 'Test UI' },
                outputSettings: [],
                formBuilder: undefined,
                outputSettingsFullList: [],
            });
        });

        it('should use sessionStorage userInterfaceId when no userInterfaceId is provided', async () => {
            const mockOutputSettings = { data: { data: [] } };
            const mockUserInterface = {
                data: {
                    id: 'session-id',
                    name: 'Session UI',
                    outputSettings: {},
                    formBuilder: JSON.stringify([]),
                },
                status: 200,
            };

            (axios.get as jest.Mock).mockResolvedValueOnce(mockOutputSettings).mockResolvedValueOnce(mockUserInterface);

            // Set sessionStorage
            sessionStorage.setItem('userInterfaceId', 'session-id');

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onFetchStudioUserInterfaceDetails();

            expect(axios.get).toHaveBeenCalledWith(
                `${mockGraFxStudioEnvironmentApiBaseUrl}/user-interfaces/session-id`,
                {
                    headers: {
                        Authorization: `Bearer ${mockAuthToken}`,
                    },
                },
            );
            expect(result).toEqual({
                userInterface: { id: 'session-id', name: 'Session UI' },
                outputSettings: [],
                formBuilder: undefined,
                outputSettingsFullList: [],
            });
        });

        it('should use custom onFetchUserInterfaceDetails callback when provided', async () => {
            const mockOutputSettings = { data: { data: [] } };
            const mockUserInterface = {
                id: 'custom-id',
                name: 'Custom UI',
                outputSettings: {},
                formBuilder: [],
            };

            const mockOnFetchUserInterfaceDetails = jest.fn().mockResolvedValue(mockUserInterface);

            (axios.get as jest.Mock).mockResolvedValueOnce(mockOutputSettings);

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
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
                outputSettingsFullList: [],
            });
        });

        it('should return error when custom onFetchUserInterfaceDetails callback fails without fallback', async () => {
            const mockOutputSettings = { data: { data: [] } };
            const mockError = new Error('Custom callback failed');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mockError as any).response = {
                status: 404,
            };

            const mockOnFetchUserInterfaceDetails = jest.fn().mockRejectedValue(mockError);

            (axios.get as jest.Mock).mockResolvedValueOnce(mockOutputSettings);

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
                'custom-id',
                mockOnFetchUserInterfaceDetails,
            );

            await expect(loader.onFetchStudioUserInterfaceDetails()).rejects.toThrow('Custom callback failed');

            expect(mockOnFetchUserInterfaceDetails).toHaveBeenCalledWith('custom-id');
            // Verify that no fallback calls were made
            expect(axios.get).toHaveBeenCalledTimes(1); // Only the output settings call
        });

        it('should fallback to default user interface when 404 error occurs for built-in implementation', async () => {
            const mockOutputSettings = { data: { data: [] } };
            const mockDefaultUserInterface = {
                data: { data: [{ id: 'default-id', name: 'Default UI', default: true, outputSettings: {} }] },
                status: 200,
            };

            (axios.get as jest.Mock)
                .mockResolvedValueOnce(mockOutputSettings) // output settings request
                .mockRejectedValueOnce({ response: { status: 404 } }) // user interface request fails with 404
                .mockResolvedValueOnce(mockDefaultUserInterface); // fallback to default user interface

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                false,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
                'non-existent-id',
            );

            const result = await loader.onFetchStudioUserInterfaceDetails();

            expect(axios.get).toHaveBeenCalledWith(
                `${mockGraFxStudioEnvironmentApiBaseUrl}/user-interfaces/non-existent-id`,
                {
                    headers: {
                        Authorization: `Bearer ${mockAuthToken}`,
                    },
                },
            );
            expect(result).toEqual({
                userInterface: { id: 'default-id', name: 'Default UI' },
                outputSettings: [],
                formBuilder: undefined,
                outputSettingsFullList: [],
            });
        });
    });
});

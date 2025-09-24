import { WellKnownConfigurationKeys } from '@chili-publish/studio-sdk';
import axios from 'axios';
import { mockProject } from '@mocks/mockProject';
import { mockApiUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting, mockOutputSetting2 } from '@mocks/mockOutputSetting';
import { StudioProjectLoader } from '../StudioProjectLoader';
import { EnvironmentApiService } from '../services/EnvironmentApiService';

jest.mock('axios');

// Mock EnvironmentApiService
jest.mock('../services/EnvironmentApiService', () => ({
    EnvironmentApiService: {
        create: jest.fn(),
    },
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
    const mockProjectDownloadUrl = 'mockProjectDownloadUrl';
    const mockProjectUploadUrl = 'mockProjectUploadUrl';
    const mockDocument = { data: { mock: 'data' } };
    const mockGenerateJson = jest.fn().mockResolvedValue(Promise.resolve(JSON.stringify(mockDocument)));

    // Mock EnvironmentApiService
    const mockEnvironmentApiService = {
        getProjectById: jest.fn().mockResolvedValue(mockProject),
        getProjectDocument: jest.fn().mockResolvedValue({ data: '{"test": "document"}' }),
        saveProjectDocument: jest.fn().mockResolvedValue({ success: true }),
        getAllUserInterfaces: jest.fn().mockResolvedValue({ data: [mockApiUserInterface] }),
        getUserInterfaceById: jest.fn().mockResolvedValue(mockApiUserInterface),
        getOutputSettings: jest.fn().mockResolvedValue({ data: [mockOutputSetting, mockOutputSetting2] }),
        getTokenService: jest.fn().mockReturnValue({
            getToken: jest.fn().mockReturnValue(mockAuthToken),
            refreshToken: jest.fn().mockResolvedValue('newToken'),
        }),
        getEnvironment: jest.fn().mockReturnValue('test-environment'),
        // Additional properties to satisfy EnvironmentApiService type
        getAllConnectors: jest.fn(),
        getConnectorById: jest.fn(),
        getConnectorByIdAs: jest.fn(),
        getOutputSettingsById: jest.fn(),
        getTaskStatus: jest.fn(),
        generateOutput: jest.fn(),
    } as unknown as EnvironmentApiService;

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock EnvironmentApiService.create to return our mock
        (EnvironmentApiService.create as jest.Mock).mockReturnValue(mockEnvironmentApiService);
    });

    describe('onProjectInfoRequested', () => {
        it('should fetch project info and cache it', async () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                false,
                mockEnvironmentApiService,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onProjectInfoRequested();

            expect(result).toEqual(mockProject);
            // Verify that the environment API service method was called
            expect(mockEnvironmentApiService.getProjectById).toHaveBeenCalledWith(mockProjectId);
        });

        it('should throw an error if project is not found', async () => {
            // Create a new mock instance that returns null
            const mockEnvironmentApiServiceWithNull = {
                ...mockEnvironmentApiService,
                getProjectById: jest.fn().mockResolvedValue(null),
            } as unknown as EnvironmentApiService;

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                false,
                mockEnvironmentApiServiceWithNull,
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
                false,
                mockEnvironmentApiService,
                undefined,
                mockProjectUploadUrl,
            );

            const result = await loader.onProjectDocumentRequested();

            expect(result).toEqual('{"data":"{\\"test\\": \\"document\\"}"}');
            // Verify that the environment API service method was called
            expect(mockEnvironmentApiService.getProjectDocument).toHaveBeenCalledWith(mockProjectId);
        });

        it('should fetch project template using download URL', async () => {
            (axios.get as jest.Mock).mockResolvedValueOnce(mockDocument);
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                false,
                mockEnvironmentApiService,
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
                false,
                mockEnvironmentApiService,
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
                false,
                mockEnvironmentApiService,
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
                false,
                mockEnvironmentApiService,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );
            loader.onProjectInfoRequested = jest.fn().mockResolvedValue(mockProject);

            const result = await loader.onProjectSave(mockGenerateJson);

            // Verify that the environment API service method was called
            expect(mockEnvironmentApiService.saveProjectDocument).toHaveBeenCalled();
            expect(result).toEqual(mockProject);
            expect(loader.onProjectInfoRequested).toHaveBeenCalled();
        });

        it('Should use fallback url to save document when document URL is not provided', async () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                false,
                mockEnvironmentApiService,
                undefined,
                mockProjectUploadUrl,
            );
            loader.onProjectInfoRequested = jest.fn().mockResolvedValue(mockProject);

            const result = await loader.onProjectSave(mockGenerateJson);

            expect(result).toEqual(mockProject);
            expect(loader.onProjectInfoRequested).toHaveBeenCalled();
            // Verify that the environment API service method was called
            expect(mockEnvironmentApiService.saveProjectDocument).toHaveBeenCalled();
        });
    });

    describe('onLogInfoRequested', () => {
        it('should return log info', () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                false,
                mockEnvironmentApiService,
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
                false,
                mockEnvironmentApiService,
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
                true, // sandbox mode
                mockEnvironmentApiService,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onFetchStudioUserInterfaceDetails();

            // Verify that the environment API service methods were called
            expect(mockEnvironmentApiService.getOutputSettings).toHaveBeenCalled();
            expect(mockEnvironmentApiService.getAllUserInterfaces).toHaveBeenCalled();
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
                false,
                mockEnvironmentApiService,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
                '1234',
            );

            const result = await loader.onFetchStudioUserInterfaceDetails();

            // Verify that the environment API service methods were called
            expect(mockEnvironmentApiService.getOutputSettings).toHaveBeenCalled();
            expect(mockEnvironmentApiService.getUserInterfaceById).toHaveBeenCalledWith('1234');
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
                false,
                mockEnvironmentApiService,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onFetchStudioUserInterfaceDetails();

            // Verify that the environment API service methods were called
            expect(mockEnvironmentApiService.getOutputSettings).toHaveBeenCalled();
            expect(mockEnvironmentApiService.getUserInterfaceById).toHaveBeenCalledWith('session-id');
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
                false,
                mockEnvironmentApiService,
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
                false,
                mockEnvironmentApiService,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
                'custom-id',
                mockOnFetchUserInterfaceDetails,
            );

            await expect(loader.onFetchStudioUserInterfaceDetails()).rejects.toThrow('Custom callback failed');

            expect(mockOnFetchUserInterfaceDetails).toHaveBeenCalledWith('custom-id');
            // Verify that only the output settings call was made
            expect(mockEnvironmentApiService.getOutputSettings).toHaveBeenCalledTimes(1);
        });

        it('should fallback to default user interface when 404 error occurs for built-in implementation', async () => {
            // Create a new mock environment API service that throws a 404 error for the specific user interface
            const mockEnvironmentApiServiceWithError = {
                ...mockEnvironmentApiService,
                getUserInterfaceById: jest.fn().mockRejectedValue({ status: 404 }),
                getAllUserInterfaces: jest.fn().mockResolvedValue({ data: [mockApiUserInterface] }),
            } as unknown as EnvironmentApiService;

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                false,
                mockEnvironmentApiServiceWithError,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
                'non-existent-id',
            );

            const result = await loader.onFetchStudioUserInterfaceDetails();

            // Verify that the environment API service methods were called
            expect(mockEnvironmentApiServiceWithError.getOutputSettings).toHaveBeenCalled();
            expect(mockEnvironmentApiServiceWithError.getUserInterfaceById).toHaveBeenCalledWith('non-existent-id');
            // Should fallback to getting all user interfaces
            expect(mockEnvironmentApiServiceWithError.getAllUserInterfaces).toHaveBeenCalled();
            expect(result).toEqual({
                userInterface: { id: mockApiUserInterface.id, name: mockApiUserInterface.name },
                outputSettings: expect.any(Array), // The outputSettings are processed and may have additional properties
                formBuilder: expect.any(Object), // The formBuilder is transformed from JSON string to object
                outputSettingsFullList: expect.any(Array), // The outputSettingsFullList are processed and may have additional properties
            });
        });
    });
});

import { WellKnownConfigurationKeys } from '@chili-publish/studio-sdk';
import { mockProject } from '@mocks/mockProject';
import { mockApiUserInterface } from '@mocks/mockUserinterface';
import { mockOutputSetting, mockOutputSetting2 } from '@mocks/mockOutputSetting';
import { StudioProjectLoader } from '../StudioProjectLoader';
import { EnvironmentApiService } from '../services/EnvironmentApiService';
import { ProjectDataClient } from '../services/ProjectDataClient';
import { exportDocument } from '../utils/documentExportHelper';

// Mock ProjectDataClient
jest.mock('../services/ProjectDataClient', () => ({
    ProjectDataClient: jest.fn().mockImplementation(() => ({
        fetchFromUrl: jest.fn(),
        saveToUrl: jest.fn(),
    })),
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
    exportDocument: jest.fn(),
}));

describe('StudioProjectLoader', () => {
    const mockProjectId = 'mockProjectId';
    const mockGraFxStudioEnvironmentApiBaseUrl = 'mockGraFxStudioEnvironmentApiBaseUrl/';
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
        getOutputTaskResult: jest.fn().mockResolvedValue({
            extensionType: 'pdf',
            outputData: new Blob(['mock output data'], { type: 'application/pdf' }),
        }),
        // Additional properties to satisfy EnvironmentApiService type
        getAllConnectors: jest.fn(),
        getConnectorById: jest.fn(),
        getConnectorByIdAs: jest.fn(),
        getOutputSettingsById: jest.fn(),
        getTaskStatus: jest.fn(),
        generateOutput: jest.fn(),
    } as unknown as EnvironmentApiService;

    // Mock ProjectDataClient
    const mockProjectDataClient = {
        fetchFromUrl: jest.fn().mockResolvedValue('{"test": "document"}'),
        saveToUrl: jest.fn().mockResolvedValue(true),
        downloadFromUrl: jest.fn().mockResolvedValue({
            extensionType: 'pdf',
            outputData: new Blob(['mock output data'], { type: 'application/pdf' }),
        }),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock EnvironmentApiService.create to return our mock
        (EnvironmentApiService.create as jest.Mock).mockReturnValue(mockEnvironmentApiService);
        // Mock ProjectDataClient constructor to return our mock
        (ProjectDataClient as jest.Mock).mockReturnValue(mockProjectDataClient);
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
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                false,
                mockEnvironmentApiService,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onProjectDocumentRequested();

            expect(result).toEqual('{"test": "document"}');
            // Verify that the project data client was called
            expect(mockProjectDataClient.fetchFromUrl).toHaveBeenCalledWith(mockProjectDownloadUrl);
        });

        it('should return "null" in case of error', async () => {
            // Mock project data client to return null (error case)
            mockProjectDataClient.fetchFromUrl.mockResolvedValueOnce(null);

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
            expect(mockProjectDataClient.fetchFromUrl).toHaveBeenCalledWith(mockProjectDownloadUrl);
            // Should NOT fallback to API when using URL approach
            expect(mockEnvironmentApiService.getProjectDocument).not.toHaveBeenCalled();
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

            // Verify that the project data client was called
            expect(mockProjectDataClient.saveToUrl).toHaveBeenCalledWith(
                mockProjectDownloadUrl,
                JSON.stringify(mockDocument),
            );
            // Should NOT call API when using URL approach
            expect(mockEnvironmentApiService.saveProjectDocument).not.toHaveBeenCalled();
            expect(result).toEqual(mockProject);
            expect(loader.onProjectInfoRequested).toHaveBeenCalled();
        });

        it('Should use API to save document when upload URL is not provided', async () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                false,
                mockEnvironmentApiService,
                undefined,
                undefined, // No upload URL
            );
            loader.onProjectInfoRequested = jest.fn().mockResolvedValue(mockProject);

            const result = await loader.onProjectSave(mockGenerateJson);

            expect(result).toEqual(mockProject);
            expect(loader.onProjectInfoRequested).toHaveBeenCalled();
            // Should NOT call URL handler when no upload URL
            expect(mockProjectDataClient.saveToUrl).not.toHaveBeenCalled();
            // Should call API when no upload URL
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

    describe('onGenerateOutput', () => {
        it('should generate output using custom onProjectGetDownloadLink callback', async () => {
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
            const mockBlob = new Blob(['mock output data'], { type: 'application/pdf' });
            const mockOutputResult = {
                extensionType: 'pdf',
                outputData: mockBlob,
            };

            // Mock the custom callback
            const mockOnProjectGetDownloadLink = jest.fn().mockResolvedValue(mockDownloadLinkResult);
            // Mock the downloadFromUrl method
            mockProjectDataClient.downloadFromUrl = jest.fn().mockResolvedValue(mockOutputResult);

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                false,
                mockEnvironmentApiService,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
                undefined,
                undefined,
                mockOnProjectGetDownloadLink,
            );

            const result = await loader.onGenerateOutput(mockExtension, mockSelectedLayoutID, mockOutputSettingsId);

            expect(mockOnProjectGetDownloadLink).toHaveBeenCalledWith(
                mockExtension,
                mockSelectedLayoutID,
                mockOutputSettingsId,
            );
            expect(mockProjectDataClient.downloadFromUrl).toHaveBeenCalledWith(mockDownloadLinkResult.data);
            expect(result).toEqual(mockOutputResult);
        });

        it('should generate output using API when no custom callback is provided', async () => {
            const mockExtension = 'pdf';
            const mockSelectedLayoutID = 'mockSelectedLayoutID';
            const mockOutputSettingsId = 'mockOutputSettingsId';
            const mockTaskId = 'mockTaskId';
            const mockBlob = new Blob(['mock output data'], { type: 'application/pdf' });
            const mockOutputResult = {
                extensionType: 'pdf',
                outputData: mockBlob,
            };

            // Mock the exportDocument function to return a task ID
            (exportDocument as jest.Mock).mockResolvedValue(mockTaskId);

            // Mock the getOutputTaskResult method
            mockEnvironmentApiService.getOutputTaskResult = jest.fn().mockResolvedValue(mockOutputResult);

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                false,
                mockEnvironmentApiService,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onGenerateOutput(mockExtension, mockSelectedLayoutID, mockOutputSettingsId);

            expect(exportDocument).toHaveBeenCalledWith(
                mockExtension,
                mockSelectedLayoutID,
                mockProjectId,
                mockOutputSettingsId,
                false,
                mockEnvironmentApiService,
            );
            expect(mockEnvironmentApiService.getOutputTaskResult).toHaveBeenCalledWith(mockTaskId);
            expect(result).toEqual(mockOutputResult);
        });

        it('should throw error when custom callback returns error status', async () => {
            const mockExtension = 'pdf';
            const mockSelectedLayoutID = 'mockSelectedLayoutID';
            const mockOutputSettingsId = 'mockOutputSettingsId';
            const mockDownloadLinkResult = {
                status: 400,
                error: 'Bad request',
                success: false,
                parsedData: null,
                data: null,
            };

            const mockOnProjectGetDownloadLink = jest.fn().mockResolvedValue(mockDownloadLinkResult);

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                false,
                mockEnvironmentApiService,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
                undefined,
                undefined,
                mockOnProjectGetDownloadLink,
            );

            await expect(
                loader.onGenerateOutput(mockExtension, mockSelectedLayoutID, mockOutputSettingsId),
            ).rejects.toThrow('Error getting download link');
        });

        it('should throw error when exportDocument fails', async () => {
            const mockExtension = 'pdf';
            const mockSelectedLayoutID = 'mockSelectedLayoutID';
            const mockOutputSettingsId = 'mockOutputSettingsId';
            const mockError = {
                error: 'Export failed',
                status: 500,
            };

            // Mock the exportDocument function to return an error
            (exportDocument as jest.Mock).mockResolvedValue(mockError);

            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                false,
                mockEnvironmentApiService,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            await expect(
                loader.onGenerateOutput(mockExtension, mockSelectedLayoutID, mockOutputSettingsId),
            ).rejects.toThrow('Error getting download link:Export failed');
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

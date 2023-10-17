import axios, { AxiosError } from 'axios';
import { WellKnownConfigurationKeys } from '@chili-publish/studio-sdk';
import { Project } from '../types/types';
import { StudioProjectLoader } from '../StudioProjectLoader';

jest.mock('axios');

jest.mock('../utils/documentExportHelper', () => ({
    getDownloadLink: jest.fn().mockReturnValue({
        status: 200,
        error: undefined,
        success: true,
        parsedData: { url: 'mockUrl' },
        data: JSON.stringify({ url: 'mockUrl' }),
    }),
}));

describe('StudioProjectLoader', () => {
    const mockProjectId = 'mockProjectId';
    const mockGraFxStudioEnvironmentApiBaseUrl = 'mockGraFxStudioEnvironmentApiBaseUrl';
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
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            await expect(loader.onProjectInfoRequested()).rejects.toThrow('Project not found');
        });
    });

    describe('onProjectTemplateRequested', () => {
        it('should fetch project template using fallback URL if download URL is not provided', async () => {
            (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockDocument.data });
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                mockRefreshTokenAction,
                undefined,
                mockProjectUploadUrl,
            );

            const result = await loader.onProjectTemplateRequested();

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
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onProjectTemplateRequested();

            expect(result).toEqual(JSON.stringify(mockDocument.data));
            expect(axios.get).toHaveBeenCalledWith(mockProjectDownloadUrl, {
                headers: { Authorization: 'Bearer mockAuthToken' },
            });
        });
    });

    describe('onProjectLoaded', () => {
        it('should set GraFxStudioEnvironmentApiUrl configuration value', () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );
            window.SDK.configuration.setValue = jest.fn();

            loader.onProjectLoaded();

            expect(window.SDK.configuration.setValue).toHaveBeenCalledWith(
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

        it('should not save document if document URL is not provided', async () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
                mockRefreshTokenAction,
                undefined,
                undefined,
            );
            loader.onProjectInfoRequested = jest.fn().mockResolvedValue(mockCachedProject);

            const result = await loader.onProjectSave(mockGenerateJson);

            expect(result).toEqual(mockCachedProject);
            expect(loader.onProjectInfoRequested).toHaveBeenCalled();
            expect(axios.put).not.toHaveBeenCalled();
        });
    });

    describe('onAuthenticationRequested', () => {
        it('should return auth token', () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
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
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            await expect(loader.onAuthenticationExpired()).rejects.toEqual(mockError);
        });
    });

    describe('onLogInfoRequested', () => {
        it('should return log info', () => {
            const loader = new StudioProjectLoader(
                mockProjectId,
                mockGraFxStudioEnvironmentApiBaseUrl,
                mockAuthToken,
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
                mockRefreshTokenAction,
                mockProjectDownloadUrl,
                mockProjectUploadUrl,
            );

            const result = await loader.onProjectGetDownloadLink(mockExtension, mockSelectedLayoutID);

            expect(result).toEqual(mockDownloadLinkResult);
        });
    });
});

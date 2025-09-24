import { DownloadFormats } from '@chili-publish/studio-sdk';
import { addTrailingSlash, getDownloadLink } from '../../utils/documentExportHelper';
import { EnvironmentApiService } from '../../services/EnvironmentApiService';

describe('"getDownloadLink', () => {
    let mockEnvironmentApiService: jest.Mocked<EnvironmentApiService>;

    beforeEach(() => {
        mockEnvironmentApiService = {
            generateOutput: jest.fn().mockResolvedValue({
                data: { taskId: 'test-task-id' },
                links: { taskInfo: 'http://test.com/task-info' },
            }),
            getOutputSettingsById: jest.fn().mockResolvedValue({
                dataSourceEnabled: true,
            }),
            getTaskStatus: jest.fn().mockResolvedValue({
                status: 200,
                data: { taskId: 'test-task-id' },
                links: { download: 'http://test.com/download' },
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
    });

    describe('handle errors correctly', () => {
        beforeEach(() => {
            window.StudioUISDK.document.getCurrentState = jest.fn().mockResolvedValue({ data: '{}' });
        });
        it('should return "Unexpected error"', async () => {
            // Mock the environment API service to throw an error
            mockEnvironmentApiService.generateOutput.mockRejectedValue(new Error('Test error'));

            const res = await getDownloadLink(
                DownloadFormats.PDF,
                '1',
                'projectId',
                undefined,
                false,
                mockEnvironmentApiService,
            );
            expect(res).toEqual({
                status: 500,
                error: 'Unexpected error during polling',
                success: false,
                parsedData: undefined,
                data: undefined,
            });
        });

        it('should return ApiError', async () => {
            // Mock the environment API service to return an error response
            mockEnvironmentApiService.generateOutput.mockResolvedValue({
                status: '503',
                detail: 'Api Error',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            const res = await getDownloadLink(
                DownloadFormats.PDF,
                '1',
                'projectId',
                undefined,
                false,
                mockEnvironmentApiService,
            );
            expect(res).toEqual({
                status: 503,
                error: 'Api Error',
                success: false,
                parsedData: undefined,
                data: undefined,
            });
        });

        it('should return "Error during polling', async () => {
            // Mock the environment API service to return a successful response
            mockEnvironmentApiService.generateOutput.mockResolvedValue({
                data: { taskId: 'test-task-id' },
                links: { taskInfo: 'http://test.com/task-info' },
            });

            // Mock getTaskStatus to return null (simulating an error)
            mockEnvironmentApiService.getTaskStatus.mockRejectedValue(null);

            const res = await getDownloadLink(
                DownloadFormats.PDF,
                '1',
                'projectId',
                undefined,
                false,
                mockEnvironmentApiService,
            );
            expect(res).toEqual({
                status: 500,
                error: 'Error during polling',
                success: false,
                parsedData: undefined,
                data: undefined,
            });
        });
    });

    describe('handle data source configuration correctly', () => {
        beforeEach(() => {
            window.StudioUISDK.document.getCurrentState = jest.fn().mockResolvedValue({ data: '{}' });
            window.StudioUISDK.dataSource.getDataSource = jest.fn().mockResolvedValue({
                parsedData: {
                    source: {
                        id: '123',
                    },
                },
            });
            window.StudioUISDK.connector.getMappings = jest.fn().mockResolvedValue({ parsedData: null });
        });
        it('should skip sending data source if output settings id is not specified', async () => {
            await getDownloadLink(DownloadFormats.PDF, '1', 'projectId', undefined, false, mockEnvironmentApiService);

            expect(mockEnvironmentApiService.generateOutput).toHaveBeenCalledWith('pdf', {
                engineVersion: undefined,
                dataConnectorConfig: undefined,
                outputSettingsId: undefined,
                layoutsToExport: ['1'],
                documentContent: JSON.parse('{}'),
                projectId: 'projectId',
            });
        });

        it('should skip sending data source if it is not defined', async () => {
            window.StudioUISDK.dataSource.getDataSource = jest.fn().mockResolvedValue({
                parsedData: null,
            });
            await getDownloadLink(DownloadFormats.PDF, '1', 'projectId', 'outputId', false, mockEnvironmentApiService);

            expect(mockEnvironmentApiService.generateOutput).toHaveBeenCalledWith('pdf', {
                engineVersion: undefined,
                dataConnectorConfig: undefined,
                outputSettingsId: 'outputId',
                layoutsToExport: ['1'],
                documentContent: JSON.parse('{}'),
                projectId: 'projectId',
            });
        });

        it('should skip sending data source if output setting does not have "dataSourceEnabled"', async () => {
            mockEnvironmentApiService.getOutputSettingsById.mockResolvedValue({
                dataSourceEnabled: false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            await getDownloadLink(DownloadFormats.PDF, '1', 'projectId', 'outputId', false, mockEnvironmentApiService);

            expect(mockEnvironmentApiService.getOutputSettingsById).toHaveBeenCalledWith('outputId');

            expect(mockEnvironmentApiService.generateOutput).toHaveBeenCalledWith('pdf', {
                engineVersion: undefined,
                dataConnectorConfig: undefined,
                outputSettingsId: 'outputId',
                layoutsToExport: ['1'],
                documentContent: JSON.parse('{}'),
                projectId: 'projectId',
            });
        });

        it('should send data source', async () => {
            mockEnvironmentApiService.getOutputSettingsById.mockResolvedValue({
                dataSourceEnabled: true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            await getDownloadLink(DownloadFormats.PDF, '1', 'projectId', 'outputId', false, mockEnvironmentApiService);

            expect(mockEnvironmentApiService.getOutputSettingsById).toHaveBeenCalledWith('outputId');

            expect(mockEnvironmentApiService.generateOutput).toHaveBeenCalledWith('pdf', {
                engineVersion: undefined,
                dataConnectorConfig: {
                    dataConnectorId: '123',
                    dataConnectorParameters: {
                        context: null,
                    },
                },
                outputSettingsId: 'outputId',
                layoutsToExport: ['1'],
                documentContent: JSON.parse('{}'),
                projectId: 'projectId',
            });
        });
    });

    describe('success path', () => {
        beforeEach(() => {
            window.StudioUISDK.document.getCurrentState = jest.fn().mockResolvedValue({ data: '{}' });
            mockEnvironmentApiService.generateOutput.mockResolvedValue({
                data: { taskId: 'test-task-id' },
                links: { taskInfo: 'http://test.com/task-info' },
            });
        });
        it('should return 200 status if all passed', async () => {
            const res = await getDownloadLink(
                DownloadFormats.PDF,
                '1',
                'projectId',
                undefined,
                false,
                mockEnvironmentApiService,
            );
            expect(res).toEqual({
                status: 200,
                error: undefined,
                success: true,
                parsedData: 'http://test.com/download',
                data: 'http://test.com/download',
            });
        });
    });
});

describe('addTrailingSlash', () => {
    it('should add trailing slash if it is missing', () => {
        expect(addTrailingSlash('http://chili.com')).toEqual('http://chili.com/');
    });

    it('should not add trailing slash if it is already there', () => {
        expect(addTrailingSlash('http://chili.com/')).toEqual('http://chili.com/');
    });
});

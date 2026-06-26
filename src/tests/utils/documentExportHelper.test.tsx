import { DataSourceVariableSourceType, DownloadFormats, VariableType } from '@chili-publish/studio-sdk';
import { addTrailingSlash, exportDocument } from '../../utils/documentExportHelper';
import { EnvironmentApiService } from '../../services/EnvironmentApiService';

describe('"exportDocument', () => {
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

            const res = await exportDocument(
                DownloadFormats.PDF,
                '1',
                'projectId',
                undefined,
                false,
                mockEnvironmentApiService,
                true,
            );
            expect(res).toEqual({
                status: 500,
                error: 'Unexpected error during polling',
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

            const res = await exportDocument(
                DownloadFormats.PDF,
                '1',
                'projectId',
                undefined,
                false,
                mockEnvironmentApiService,
                true,
            );
            expect(res).toEqual({
                status: 503,
                error: 'Api Error',
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

            const res = await exportDocument(
                DownloadFormats.PDF,
                '1',
                'projectId',
                undefined,
                false,
                mockEnvironmentApiService,
                true,
            );
            expect(res).toEqual({
                status: 500,
                error: 'Error during polling',
                data: undefined,
            });
        });
    });

    describe('handle data source configuration correctly on dev environment', () => {
        beforeEach(() => {
            window.StudioUISDK.document.getCurrentState = jest
                .fn()
                .mockResolvedValue({ data: '{}', parsedData: { engineVersion: '1.0.0' } });
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
            await exportDocument(
                DownloadFormats.PDF,
                '1',
                'projectId',
                undefined,
                false,
                mockEnvironmentApiService,
                true,
            );

            expect(mockEnvironmentApiService.generateOutput).toHaveBeenCalledWith('pdf', {
                engineVersion: '1.0.0',
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
            await exportDocument(
                DownloadFormats.PDF,
                '1',
                'projectId',
                'outputId',
                false,
                mockEnvironmentApiService,
                true,
            );

            expect(mockEnvironmentApiService.generateOutput).toHaveBeenCalledWith('pdf', {
                engineVersion: '1.0.0',
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

            await exportDocument(
                DownloadFormats.PDF,
                '1',
                'projectId',
                'outputId',
                false,
                mockEnvironmentApiService,
                true,
            );

            expect(mockEnvironmentApiService.getOutputSettingsById).toHaveBeenCalledWith('outputId');

            expect(mockEnvironmentApiService.generateOutput).toHaveBeenCalledWith('pdf', {
                engineVersion: '1.0.0',
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

            await exportDocument(
                DownloadFormats.PDF,
                '1',
                'projectId',
                'outputId',
                false,
                mockEnvironmentApiService,
                true,
            );

            expect(mockEnvironmentApiService.getOutputSettingsById).toHaveBeenCalledWith('outputId');

            expect(mockEnvironmentApiService.generateOutput).toHaveBeenCalledWith('pdf', {
                engineVersion: '1.0.0',
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
    describe('handle data source configuration correctly on production environment', () => {
        beforeEach(() => {
            window.StudioUISDK.document.getCurrentState = jest
                .fn()
                .mockResolvedValue({ data: '{}', parsedData: { engineVersion: '1.0.0' } });
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
            await exportDocument(
                DownloadFormats.PDF,
                '1',
                'projectId',
                undefined,
                false,
                mockEnvironmentApiService,
                false,
            );

            expect(mockEnvironmentApiService.generateOutput).toHaveBeenCalledWith('pdf', {
                engineVersion: null,
                dataConnectorConfig: undefined,
                outputSettingsId: undefined,
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

            await exportDocument(
                DownloadFormats.PDF,
                '1',
                'projectId',
                'outputId',
                false,
                mockEnvironmentApiService,
                false,
            );

            expect(mockEnvironmentApiService.getOutputSettingsById).toHaveBeenCalledWith('outputId');

            expect(mockEnvironmentApiService.generateOutput).toHaveBeenCalledWith('pdf', {
                engineVersion: null,
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

    describe('when dataSourceBatchOutputOff is true', () => {
        const injectedVariable = {
            id: 'ds-var-1',
            name: 'InjectedDS',
            type: VariableType.dataSource,
            value: { type: DataSourceVariableSourceType.injected },
        };
        const injectedVariableEmpty = {
            id: 'ds-var-empty',
            name: 'InjectedDSEmpty',
            type: VariableType.dataSource,
            value: { type: DataSourceVariableSourceType.injected },
        };
        const connectorVariable = {
            id: 'ds-var-2',
            name: 'ConnectorDS',
            type: VariableType.dataSource,
            value: { type: DataSourceVariableSourceType.connector, connectorId: 'connector-1' },
        };
        const shortTextVariable = {
            id: 'st-var-1',
            name: 'ShortText',
            type: VariableType.shortText,
            value: 'hello',
        };

        const documentBody = JSON.stringify({
            variables: [injectedVariable, injectedVariableEmpty, connectorVariable, shortTextVariable],
        });

        const injectedData = [
            { id: '1', name: 'Joe' },
            { id: '2', name: 'John' },
        ];

        beforeEach(() => {
            window.StudioUISDK.document.getCurrentState = jest
                .fn()
                .mockResolvedValue({ data: documentBody, parsedData: { engineVersion: '1.0.0' } });
            window.StudioUISDK.dataSource.getDataSource = jest.fn().mockResolvedValue({
                parsedData: null,
            });
            window.StudioUISDK.variable.dataSource = {
                getInjectedData: jest.fn().mockImplementation((variableId: string) => {
                    if (variableId === injectedVariableEmpty.id) {
                        return Promise.resolve({ parsedData: { data: [] } });
                    }
                    return Promise.resolve({ parsedData: { data: injectedData } });
                }),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
        });

        it('should include injected data source variables in the request and skip non-injected and empty ones', async () => {
            await exportDocument(
                DownloadFormats.PDF,
                '1',
                'projectId',
                'outputId',
                false,
                mockEnvironmentApiService,
                true,
            );

            expect(window.StudioUISDK.variable.dataSource.getInjectedData).toHaveBeenCalledWith(injectedVariable.id);
            expect(window.StudioUISDK.variable.dataSource.getInjectedData).toHaveBeenCalledWith(
                injectedVariableEmpty.id,
            );
            expect(window.StudioUISDK.variable.dataSource.getInjectedData).not.toHaveBeenCalledWith(
                connectorVariable.id,
            );
            expect(window.StudioUISDK.variable.dataSource.getInjectedData).not.toHaveBeenCalledWith(
                shortTextVariable.id,
            );

            expect(mockEnvironmentApiService.generateOutput).toHaveBeenCalledWith('pdf', {
                engineVersion: '1.0.0',
                dataConnectorConfig: undefined,
                outputSettingsId: 'outputId',
                layoutsToExport: ['1'],
                documentContent: JSON.parse(documentBody),
                projectId: 'projectId',
                variables: [{ [injectedVariable.name]: injectedData }],
            });
        });

        it('should not include "variables" in the request when there are no injected data source variables', async () => {
            const bodyWithoutInjected = JSON.stringify({
                variables: [connectorVariable, shortTextVariable],
            });
            window.StudioUISDK.document.getCurrentState = jest
                .fn()
                .mockResolvedValue({ data: bodyWithoutInjected, parsedData: { engineVersion: '1.0.0' } });

            await exportDocument(
                DownloadFormats.PDF,
                '1',
                'projectId',
                'outputId',
                false,
                mockEnvironmentApiService,
                true,
            );

            expect(window.StudioUISDK.variable.dataSource.getInjectedData).not.toHaveBeenCalled();

            const requestBody = mockEnvironmentApiService.generateOutput.mock.calls[0][1] as Record<string, unknown>;
            expect(requestBody).not.toHaveProperty('variables');
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
            const res = await exportDocument(
                DownloadFormats.PDF,
                '1',
                'projectId',
                undefined,
                false,
                mockEnvironmentApiService,
                true,
            );
            expect(res).toEqual('test-task-id');
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

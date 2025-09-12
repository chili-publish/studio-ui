import { ConnectorsApi, ProjectsApi, UserInterfacesApi, OutputApi } from '@chili-publish/environment-client-api';
import {
    APIUserInterface,
    GenerateOutputResponse,
    GenerateOutputTaskPollingResponse,
    IOutputSetting,
    OutputGenerationRequest,
} from 'src/types/types';

/**
 * Centralized service for environment client API operations
 * This provides a consistent interface for all environment API interactions
 * and makes it easier to manage API changes and updates
 */
export class EnvironmentApiService {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private connectorsApi: ConnectorsApi,
        private projectsApi: ProjectsApi,
        private userInterfacesApi: UserInterfacesApi,
        private outputApi: OutputApi,
        private environment: string,
        // eslint-disable-next-line no-empty-function
    ) {}

    // Connectors API methods
    async getAllConnectors() {
        return this.connectorsApi.apiV1EnvironmentEnvironmentConnectorsGet({
            environment: this.environment,
        });
    }

    async getConnectorById(connectorId: string) {
        return this.connectorsApi.apiV1EnvironmentEnvironmentConnectorsConnectorIdGet({
            environment: this.environment,
            connectorId,
        });
    }

    // Generic connector method with proper type transformations
    async getConnectorByIdAs<T>(connectorId: string): Promise<T> {
        const connector = await this.getConnectorById(connectorId);
        return connector as unknown as T; // TODO: Remove casting when environment client API types are aligned to our code or the other way around
    }

    // Projects API methods
    async getProjectById(projectId: string) {
        return this.projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdGet({
            environment: this.environment,
            projectId,
        });
    }

    async getProjectDocument(projectId: string) {
        return this.projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdDocumentGet({
            environment: this.environment,
            projectId,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async saveProjectDocument(projectId: string, document: any) {
        return this.projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut({
            environment: this.environment,
            projectId,
            requestBody: document,
        });
    }

    // User Interfaces API methods
    async getAllUserInterfaces() {
        const userInterfaces = this.userInterfacesApi.apiV1EnvironmentEnvironmentUserInterfacesGet({
            environment: this.environment,
        });
        return userInterfaces as unknown as { data: APIUserInterface[] }; // TODO: Remove casting when  env api or our code is updated
    }

    async getUserInterfaceById(userInterfaceId: string) {
        return this.userInterfacesApi.apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet({
            environment: this.environment,
            userInterfaceId,
        }) as unknown as APIUserInterface; // TODO: Remove casting when env api or our code is updated
    }

    // Output API methods
    async getOutputSettings() {
        return this.outputApi.apiV1EnvironmentEnvironmentOutputSettingsGet({
            environment: this.environment,
        }) as unknown as { data: IOutputSetting[] }; // TODO: Remove casting when env api is updated
    }

    async getOutputSettingsById(outputSettingsId: string) {
        return this.outputApi.apiV1EnvironmentEnvironmentOutputSettingsOutputSettingsIdGet({
            environment: this.environment,
            outputSettingsId,
        });
    }

    async getTaskStatus(taskId: string) {
        return this.outputApi.apiV1EnvironmentEnvironmentOutputTasksTaskIdGet({
            environment: this.environment,
            taskId,
        }) as unknown as Promise<GenerateOutputTaskPollingResponse>; // TODO: Remove casting when env api is updated currently returning Promise<object | null | undefined >
    }

    // Generic output generation method
    async generateOutput(format: string, requestBody: OutputGenerationRequest) {
        // Map format to the appropriate API method
        switch (format.toLowerCase()) {
            case 'gif':
                return this.outputApi.apiV1EnvironmentEnvironmentOutputGifPost({
                    environment: this.environment,
                    generateGifOutputRequest: requestBody,
                }) as unknown as GenerateOutputResponse; // TODO: Remove casting when env api is updated currently returning Promise<object>
            case 'jpg':
                return this.outputApi.apiV1EnvironmentEnvironmentOutputJpgPost({
                    environment: this.environment,
                    generateJpgOutputRequest: requestBody,
                }) as unknown as GenerateOutputResponse; // TODO: Remove casting when env api is updated currently returning Promise<object>
            case 'mp4':
                return this.outputApi.apiV1EnvironmentEnvironmentOutputMp4Post({
                    environment: this.environment,
                    generateMp4OutputRequest: requestBody,
                }) as unknown as GenerateOutputResponse; // TODO: Remove casting when env api is updated currently returning Promise<object>
            case 'pdf':
                return this.outputApi.apiV1EnvironmentEnvironmentOutputPdfPost({
                    environment: this.environment,
                    generatePdfOutputRequest: requestBody,
                }) as unknown as GenerateOutputResponse; // TODO: Remove casting when env api is updated currently returning Promise<object>
            case 'png':
                return this.outputApi.apiV1EnvironmentEnvironmentOutputPngPost({
                    environment: this.environment,
                    generatePngOutputRequest: requestBody,
                }) as unknown as GenerateOutputResponse; // TODO: Remove casting when env api is updated currently returning Promise<object>
            default:
                throw new Error(`Unsupported output format: ${format}`);
        }
    }
}

import { ConnectorsApi, ProjectsApi, UserInterfacesApi, OutputApi } from '@chili-publish/environment-client-api';
import { APIUserInterface, IOutputSetting } from 'src/types/types';
import { DataRemoteConnector, MediaRemoteConnector } from '../utils/ApiTypes';

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

    // Specialized connector methods with proper type transformations
    async getDataConnectorById(connectorId: string): Promise<DataRemoteConnector> {
        const connector = await this.getConnectorById(connectorId);
        return connector as unknown as DataRemoteConnector; // TODO: Remove casting when environment client API types are aligned to our code or the other way around
    }

    async getMediaConnectorById(connectorId: string): Promise<MediaRemoteConnector> {
        const connector = await this.getConnectorById(connectorId);
        return connector as unknown as MediaRemoteConnector; // TODO: Remove casting when environment client API types are aligned to our code or the other way around
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
}

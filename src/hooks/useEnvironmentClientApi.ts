import { useMemo } from 'react';
import { useEnvironmentClientApiContext } from '../contexts/EnvironmentClientApiContext';

/**
 * Custom hook that provides a wrapper around the environment client APIs
 * with more intuitive method names for better developer experience
 */
export function useEnvironmentClientApi() {
    const { connectorsApi, projectsApi, userInterfacesApi, outputApi, environment } = useEnvironmentClientApiContext();

    const connectors = useMemo(
        () => ({
            getAll: () =>
                connectorsApi.apiV1EnvironmentEnvironmentConnectorsGet({
                    environment,
                }),
            getById: (connectorId: string) =>
                connectorsApi.apiV1EnvironmentEnvironmentConnectorsConnectorIdGet({
                    environment,
                    connectorId,
                }),
        }),
        [connectorsApi, environment],
    );

    const projects = useMemo(
        () => ({
            getById: (projectId: string) =>
                projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdGet({
                    environment,
                    projectId,
                }),
            getDocument: (projectId: string) =>
                projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdDocumentGet({
                    environment,
                    projectId,
                }),
            saveDocument: (
                projectId: string,
                document: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
            ) =>
                projectsApi.apiV1EnvironmentEnvironmentProjectsProjectIdDocumentPut({
                    environment,
                    projectId,
                    requestBody: document,
                }),
        }),
        [projectsApi, environment],
    );

    const userInterfaces = useMemo(
        () => ({
            getAll: () =>
                userInterfacesApi.apiV1EnvironmentEnvironmentUserInterfacesGet({
                    environment,
                }),
            getById: (userInterfaceId: string) =>
                userInterfacesApi.apiV1EnvironmentEnvironmentUserInterfacesUserInterfaceIdGet({
                    environment,
                    userInterfaceId,
                }),
        }),
        [userInterfacesApi, environment],
    );

    const output = useMemo(
        () => ({
            getSettings: () =>
                outputApi.apiV1EnvironmentEnvironmentOutputSettingsGet({
                    environment,
                }),
        }),
        [outputApi, environment],
    );

    return {
        environment,

        // Connectors API wrapper
        connectors,

        // Projects API wrapper
        projects,

        // User Interfaces API wrapper
        userInterfaces,

        // Settings API wrapper
        settings: {
            // Add settings methods as needed
        },

        // Output API wrapper
        output,
    };
}

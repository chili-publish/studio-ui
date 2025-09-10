import { useMemo } from 'react';
import { useEnvironmentClientApiContext } from '../contexts/EnvironmentClientApiContext';
import { EnvironmentApiService } from '../services/EnvironmentApiService';

/**
 * Custom hook that provides a wrapper around the environment client APIs
 * with more intuitive method names for better developer experience
 * Now uses the centralized EnvironmentApiService for consistency
 */
export function useEnvironmentClientApi() {
    const { connectorsApi, projectsApi, userInterfacesApi, outputApi, environment } = useEnvironmentClientApiContext();

    const apiService = useMemo(
        () => new EnvironmentApiService(connectorsApi, projectsApi, userInterfacesApi, outputApi, environment),
        [connectorsApi, projectsApi, userInterfacesApi, outputApi, environment],
    );

    const connectors = useMemo(
        () => ({
            getAll: () => apiService.getAllConnectors(),
            getById: (connectorId: string) => apiService.getConnectorById(connectorId),
            getDataConnectorById: (connectorId: string) => apiService.getDataConnectorById(connectorId),
            getMediaConnectorById: (connectorId: string) => apiService.getMediaConnectorById(connectorId),
        }),
        [apiService],
    );

    const projects = useMemo(
        () => ({
            getById: (projectId: string) => apiService.getProjectById(projectId),
            getDocument: (projectId: string) => apiService.getProjectDocument(projectId),
            saveDocument: (projectId: string, document: any) => apiService.saveProjectDocument(projectId, document), // eslint-disable-line @typescript-eslint/no-explicit-any
        }),
        [apiService],
    );

    const userInterfaces = useMemo(
        () => ({
            getAll: () => apiService.getAllUserInterfaces(),
            getById: (userInterfaceId: string) => apiService.getUserInterfaceById(userInterfaceId),
        }),
        [apiService],
    );

    const output = useMemo(
        () => ({
            getSettings: () => apiService.getOutputSettings(),
        }),
        [apiService],
    );

    return {
        environment,

        // Connectors API wrapper
        connectors,

        // Projects API wrapper
        projects,

        // User Interfaces API wrapper
        userInterfaces,

        // Output API wrapper
        output,
    };
}

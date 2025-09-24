import { useMemo } from 'react';
import { useEnvironmentClientApiContext } from '../contexts/EnvironmentClientApiContext';

/**
 * Custom hook that provides a wrapper around the environment client APIs
 * with more intuitive method names for better developer experience
 * Now uses the centralized EnvironmentApiService for consistency
 */
export function useEnvironmentClientApi() {
    const { environmentApiService } = useEnvironmentClientApiContext();

    const connectors = useMemo(
        () => ({
            getAll: () => environmentApiService.getAllConnectors(),
            getById: (connectorId: string) => environmentApiService.getConnectorById(connectorId),
            getByIdAs: <T>(connectorId: string) => environmentApiService.getConnectorByIdAs<T>(connectorId),
        }),
        [environmentApiService],
    );

    return {
        // Connectors API wrapper
        connectors,
    };
}

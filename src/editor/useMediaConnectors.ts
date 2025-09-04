import { useCallback } from 'react';
import { useAuthToken } from '../contexts/AuthTokenProvider';
import { useEnvironmentClientApi } from '../hooks/useEnvironmentClientApi';
import { useAppDispatch } from '../store';
import { getEnvironmentConnectorsFromDocument, setMediaConnectors } from '../store/reducers/mediaReducer';
import { MediaRemoteConnector } from '../utils/ApiTypes';

export const useMediaConnectors = () => {
    const dispatch = useAppDispatch();
    const { authToken } = useAuthToken();
    const { getConnectorById } = useEnvironmentClientApi();

    const getConnectorByIdWrapper = useCallback(
        async (connectorId: string): Promise<MediaRemoteConnector> => {
            const connector = await getConnectorById(connectorId);
            // Convert ConnectorDefinition to MediaRemoteConnector
            return {
                id: connector.id || connectorId,
                name: connector.name || connectorId,
                type: 'media' as const,
                scriptSource: 'external' as const,
                description: connector.description || '',
                iconUrl: connector.iconUrl || null,
                default: false, // Default value for missing property
                enabled: connector.enabled || true,
                supportedAuthentication: {
                    browser: ['none'], // Default to none for compatibility
                },
                ownerType: 'builtIn' as const,
            };
        },
        [getConnectorById],
    );

    const loadConnectors = useCallback(() => {
        dispatch(getEnvironmentConnectorsFromDocument({ authToken, getConnectorById: getConnectorByIdWrapper }))
            .unwrap()
            .then((connectors) => dispatch(setMediaConnectors(connectors)));
    }, [dispatch, authToken, getConnectorByIdWrapper]);

    return {
        loadConnectors,
    };
};

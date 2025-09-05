import { useCallback } from 'react';
import { useAuthToken } from '../contexts/AuthTokenProvider';
import { useEnvironmentClientApi } from '../hooks/useEnvironmentClientApi';
import { useAppDispatch } from '../store';
import { getEnvironmentConnectorsFromDocument, setMediaConnectors } from '../store/reducers/mediaReducer';
import { MediaRemoteConnector } from '../utils/ApiTypes';

export const useMediaConnectors = () => {
    const dispatch = useAppDispatch();
    const { authToken } = useAuthToken();
    const { connectors } = useEnvironmentClientApi();

    const getConnectorByIdWrapper = useCallback(
        async (connectorId: string): Promise<MediaRemoteConnector> => {
            const connector = await connectors.getById(connectorId);
            return connector as unknown as MediaRemoteConnector;
        },
        [connectors],
    );

    const loadConnectors = useCallback(() => {
        dispatch(getEnvironmentConnectorsFromDocument({ authToken, getConnectorById: getConnectorByIdWrapper }))
            .unwrap()
            .then((connectorsList) => dispatch(setMediaConnectors(connectorsList)));
    }, [dispatch, authToken, getConnectorByIdWrapper]);

    return {
        loadConnectors,
    };
};

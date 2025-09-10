import { useCallback } from 'react';
import { useEnvironmentClientApi } from '../hooks/useEnvironmentClientApi';
import { useAppDispatch } from '../store';
import { getEnvironmentConnectorsFromDocument, setMediaConnectors } from '../store/reducers/mediaReducer';
import { MediaRemoteConnector } from '../utils/ApiTypes';

export const useMediaConnectors = () => {
    const dispatch = useAppDispatch();
    const { connectors } = useEnvironmentClientApi();

    const getConnectorByIdWrapper = useCallback(
        async (connectorId: string): Promise<MediaRemoteConnector> => {
            return connectors.getMediaConnectorById(connectorId);
        },
        [connectors],
    );

    const loadConnectors = useCallback(() => {
        dispatch(getEnvironmentConnectorsFromDocument({ getConnectorById: getConnectorByIdWrapper }))
            .unwrap()
            .then((connectorsList) => dispatch(setMediaConnectors(connectorsList)));
    }, [dispatch, getConnectorByIdWrapper]);

    return {
        loadConnectors,
    };
};

import { useCallback } from 'react';
import { useEnvironmentClientApi } from '../hooks/useEnvironmentClientApi';
import { useAppDispatch } from '../store';
import { getEnvironmentConnectorsFromDocument, setMediaConnectors } from '../store/reducers/mediaReducer';
import { MediaRemoteConnector } from '../utils/ApiTypes';

export const useMediaConnectors = () => {
    const dispatch = useAppDispatch();
    const { connectors } = useEnvironmentClientApi();

    const loadConnectors = useCallback(() => {
        dispatch(
            getEnvironmentConnectorsFromDocument({
                getConnectorById: (connectorId) => connectors.getByIdAs<MediaRemoteConnector>(connectorId),
            }),
        )
            .unwrap()
            .then((connectorsList) => dispatch(setMediaConnectors(connectorsList)));
    }, [connectors, dispatch]);

    return {
        loadConnectors,
    };
};

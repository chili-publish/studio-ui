import { useCallback } from 'react';
import { useAuthToken } from '../contexts/AuthTokenProvider';
import { useEnvironmentClientApi } from '../hooks/useEnvironmentClientApi';
import { useAppDispatch } from '../store';
import { getEnvironmentConnectorsFromDocument, setMediaConnectors } from '../store/reducers/mediaReducer';

export const useMediaConnectors = () => {
    const dispatch = useAppDispatch();
    const { authToken } = useAuthToken();
    const { getConnectorById } = useEnvironmentClientApi();

    const loadConnectors = useCallback(() => {
        dispatch(getEnvironmentConnectorsFromDocument({ authToken, getConnectorById }))
            .unwrap()
            .then((connectors) => dispatch(setMediaConnectors(connectors)));
    }, [dispatch, authToken, getConnectorById]);

    return {
        loadConnectors,
    };
};

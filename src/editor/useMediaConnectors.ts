import { useCallback } from 'react';
import { useAuthToken } from '../contexts/AuthTokenProvider';
import { useAppDispatch } from '../store';
import { getEnvironmentConnectorsFromDocument, setMediaConnectors } from '../store/reducers/mediaReducer';

export const useMediaConnectors = () => {
    const dispatch = useAppDispatch();
    const { authToken } = useAuthToken();

    const loadConnectors = useCallback(() => {
        dispatch(getEnvironmentConnectorsFromDocument({ authToken }))
            .unwrap()
            .then((connectors) => dispatch(setMediaConnectors(connectors)));
    }, [dispatch]);

    return {
        loadConnectors,
    };
};

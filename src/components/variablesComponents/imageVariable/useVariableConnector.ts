import { useState, useEffect } from 'react';
import { ImageVariable } from '@chili-publish/studio-sdk';
import { MediaRemoteConnector } from '../../../utils/ApiTypes';
import { getRemoteMediaConnector } from '../../../utils/connectors';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import { useAuthToken } from '../../../contexts/AuthTokenProvider';

export const useVariableConnector = (variable: ImageVariable) => {
    const [selectedConnector, setSelectedConnector] = useState<MediaRemoteConnector>();
    const { graFxStudioEnvironmentApiBaseUrl } = useUiConfigContext();
    const { authToken } = useAuthToken();

    useEffect(() => {
        (async () => {
            if (variable.value?.connectorId) {
                const remoteMediaConnector = await getRemoteMediaConnector(
                    graFxStudioEnvironmentApiBaseUrl,
                    variable.value.connectorId,
                    authToken,
                );
                setSelectedConnector(remoteMediaConnector);
            }
        })();
    }, [graFxStudioEnvironmentApiBaseUrl, authToken, variable.value?.connectorId]);

    return {
        selectedConnector,
    };
};

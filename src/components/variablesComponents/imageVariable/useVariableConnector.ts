import { ImageVariable } from '@chili-publish/studio-sdk';
import { useEffect, useState } from 'react';
import { useAuthToken } from '../../../contexts/AuthTokenProvider';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import { MediaRemoteConnector } from '../../../utils/ApiTypes';
import { getRemoteConnector } from '../../../utils/connectors';

export const useVariableConnector = (variable: ImageVariable) => {
    const [selectedConnector, setSelectedConnector] = useState<MediaRemoteConnector>();
    const { graFxStudioEnvironmentApiBaseUrl } = useUiConfigContext();
    const { authToken } = useAuthToken();

    useEffect(() => {
        (async () => {
            if (variable.value?.connectorId) {
                const remoteMediaConnector = await getRemoteConnector<MediaRemoteConnector>(
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

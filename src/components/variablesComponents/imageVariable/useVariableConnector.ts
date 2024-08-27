import { useState, useEffect } from 'react';
import { ImageVariable } from '@chili-publish/studio-sdk';
import { MediaRemoteConnector } from '../../../utils/ApiTypes';
import { getRemoteMediaConnector } from '../../../utils/connectors';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';

export const useVariableConnector = (variable: ImageVariable) => {
    const [selectedConnector, setSelectedConnector] = useState<MediaRemoteConnector>();
    const { graFxStudioEnvironmentApiBaseUrl } = useUiConfigContext();
    useEffect(() => {
        (async () => {
            if (variable.value?.connectorId) {
                const remoteMediaConnector = await getRemoteMediaConnector(
                    graFxStudioEnvironmentApiBaseUrl,
                    variable.value.connectorId,
                );
                setSelectedConnector(remoteMediaConnector);
            }
        })();
    }, [graFxStudioEnvironmentApiBaseUrl, variable.value?.connectorId]);

    return {
        selectedConnector,
    };
};

import { useState, useEffect } from 'react';
import { ImageVariable } from '@chili-publish/studio-sdk';
import { MediaRemoteConnector } from '../../../utils/ApiTypes';
import { getRemoteMediaConnector } from '../../../utils/connectors';

export const useVariableConnector = (variable: ImageVariable) => {
    const [selectedConnector, setSelectedConnector] = useState<MediaRemoteConnector>();

    useEffect(() => {
        (async () => {
            if (variable.value?.connectorId) {
                const remoteMediaConnector = await getRemoteMediaConnector(variable.value.connectorId);
                setSelectedConnector(remoteMediaConnector);
            }
        })();
    }, [variable.value?.connectorId]);

    return {
        selectedConnector,
    };
};

import { ImageVariable } from '@chili-publish/studio-sdk';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectMediaConnectors } from 'src/store/reducers/mediaReducer';
import { MediaRemoteConnector } from '../../../utils/ApiTypes';

export const useVariableConnector = (variable: ImageVariable) => {
    const [remoteConnector, setRemoteConnector] = useState<MediaRemoteConnector>();
    const connectors = useSelector(selectMediaConnectors);

    useEffect(() => {
        if (variable.value?.connectorId) {
            setRemoteConnector(connectors[variable.value.connectorId]);
        }
    }, [variable.value?.connectorId, connectors]);

    return {
        remoteConnector,
    };
};

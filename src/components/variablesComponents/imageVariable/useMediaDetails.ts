import { ConnectorMappingDirection, ConnectorStateType, Media } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useVariablesChange } from '../../../core/hooks/useVariablesChange';
import { fromLinkToVariableId, isLinkToVariable } from '../../../utils/connectors';
import { useAppDispatch } from '../../../store';
import { getCapabilitiesForConnector, selectConnectorCapabilities } from '../../../store/reducers/mediaReducer';

export const useMediaDetails = (connectorId: string | undefined, mediaAssetId: string | undefined) => {
    const dispatch = useAppDispatch();
    const [mediaDetails, setMediaDetails] = useState<Media | null>(null);
    const [mediaConnectorState, setMediaConnectorState] = useState<ConnectorStateType.ready | null>(null);
    const [variableIdsInMapping, setVariableIdsInMapping] = useState<Array<string>>([]);
    const { currentVariables } = useVariablesChange(variableIdsInMapping);

    const connectorCapabilities = useSelector(selectConnectorCapabilities);
    const getMediaDetails = useCallback(async () => {
        if (!connectorId || !mediaAssetId) {
            return null;
        }

        if (connectorCapabilities[connectorId]?.query && connectorCapabilities[connectorId]?.filtering) {
            const { parsedData } = await window.StudioUISDK.mediaConnector.query(
                connectorId,
                { filter: [mediaAssetId], pageSize: 1 },
                {},
            );
            return parsedData?.data[0] ?? null;
        }
        if (connectorCapabilities[connectorId]?.detail) {
            const { parsedData } = await window.StudioUISDK.mediaConnector.detail(connectorId, mediaAssetId);
            return parsedData;
        }
        return null;
    }, [connectorId, mediaAssetId, connectorCapabilities]);

    useEffect(() => {
        (async () => {
            if (!connectorId) {
                return;
            }
            const connectorState = await window.StudioUISDK.connector.getState(connectorId);
            if (connectorState.parsedData?.type !== 'ready') {
                await window.StudioUISDK.connector.waitToBeReady(connectorId);
            }
            setMediaConnectorState(ConnectorStateType.ready);
        })();
    }, [connectorId]);

    useEffect(() => {
        (async () => {
            if (!connectorId || mediaConnectorState === null) {
                return;
            }
            const mappings = await window.StudioUISDK.connector.getMappings(
                connectorId,
                ConnectorMappingDirection.engineToConnector,
            );
            const variableIds = mappings.parsedData
                ?.filter((m) => isLinkToVariable(m))
                .map((m) => fromLinkToVariableId(m.value));
            setVariableIdsInMapping(variableIds ?? []);
        })();
    }, [connectorId, mediaConnectorState]);

    useEffect(() => {
        (async () => {
            if (!connectorId || connectorCapabilities[connectorId] || mediaConnectorState === null) {
                return;
            }

            await dispatch(getCapabilitiesForConnector({ connectorId }));
        })();
    }, [connectorId, connectorCapabilities, mediaConnectorState, dispatch]);

    useEffect(() => {
        getMediaDetails().then((media) => setMediaDetails(media));
    }, [currentVariables, getMediaDetails]);

    return mediaDetails;
};

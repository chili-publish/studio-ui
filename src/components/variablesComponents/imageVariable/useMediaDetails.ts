import { ConnectorMappingDirection, ConnectorStateType, Media } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useState } from 'react';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { useVariablesChange } from '../../../core/hooks/useVariablesChange';
import { fromLinkToVariableId, isLinkToVariable } from '../../../utils/connectors';

export const useMediaDetails = (connectorId: string | undefined, mediaAssetId: string | undefined) => {
    const { connectorCapabilities, getCapabilitiesForConnector } = useVariablePanelContext();

    const [mediaDetails, setMediaDetails] = useState<Media | null>(null);
    const [mediaConnectorState, setMediaConnectorState] = useState<ConnectorStateType.ready | null>(null);
    const [variableIdsInMapping, setVariableIdsInMapping] = useState<Array<string>>([]);

    const getMediaDetails = useCallback(async () => {
        if (!connectorId || !connectorCapabilities[connectorId]?.query || !mediaAssetId) {
            return;
        }

        const { parsedData } = await window.StudioUISDK.mediaConnector.query(
            connectorId,
            connectorCapabilities[connectorId]?.filtering
                ? {
                      filter: [mediaAssetId],
                  }
                : {},
            {},
        );
        setMediaDetails(parsedData?.data[0] ?? null);
    }, [connectorId, mediaAssetId, connectorCapabilities]);

    const { currentVariables } = useVariablesChange(variableIdsInMapping);

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

            await getCapabilitiesForConnector(connectorId);
        })();
    }, [getCapabilitiesForConnector, connectorId, connectorCapabilities, mediaConnectorState]);

    useEffect(() => {
        getMediaDetails();
    }, [currentVariables, getMediaDetails]);

    return mediaDetails;
};

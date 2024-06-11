import { useCallback, useEffect, useState } from 'react';
import { ConnectorMappingDirection, ConnectorStateType, Media } from '@chili-publish/studio-sdk';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { useSubscriberContext } from '../../../contexts/Subscriber';

export const useMediaDetails = (connectorId: string | undefined, mediaAssetId: string | undefined) => {
    const { connectorCapabilities, getCapabilitiesForConnector } = useVariablePanelContext();
    const { subscriber } = useSubscriberContext();

    const [mediaDetails, setMediaDetails] = useState<Media | null>(null);
    const [mediaConnectorState, setMediaConnectorState] = useState<ConnectorStateType.ready | null>(null);
    const [variableIdsInMapping, setVariableIdsInMapping] = useState<Array<string>>([]);

    const getMediaDetails = useCallback(async () => {
        if (!connectorId || !connectorCapabilities[connectorId]?.query || !mediaAssetId) {
            return;
        }

        const { parsedData } = await window.SDK.mediaConnector.query(
            connectorId,
            {
                filter: [mediaAssetId],
            },
            {},
        );
        setMediaDetails(parsedData?.data[0] ?? null);
    }, [connectorId, mediaAssetId, connectorCapabilities]);

    useEffect(() => {
        (async () => {
            if (!connectorId) {
                return;
            }
            const connectorState = await window.SDK.connector.getState(connectorId);
            if (connectorState.parsedData?.type !== 'ready') {
                await window.SDK.connector.waitToBeReady(connectorId);
            }
            setMediaConnectorState(ConnectorStateType.ready);
        })();
    }, [connectorId]);

    useEffect(() => {
        (async () => {
            if (!connectorId || mediaConnectorState === null) {
                return;
            }
            const mappings = await window.SDK.connector.getMappings(connectorId);
            const variableIds = mappings.parsedData
                ?.filter((m) => m.direction === ConnectorMappingDirection.engineToConnector)
                .filter((m) => m.value.startsWith('var.'))
                .map((m) => m.value.replace('var.', ''));
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
        const handler = (event: { id: string; value: string | boolean }) => {
            if (variableIdsInMapping.includes(event.id)) {
                getMediaDetails();
            }
        };
        subscriber?.on('onVariableValueChanged', handler);
        return () => subscriber?.off('onVariableValueChanged', handler);
    }, [subscriber, getMediaDetails, variableIdsInMapping]);

    useEffect(() => {
        getMediaDetails();
    }, [getMediaDetails]);

    return mediaDetails;
};

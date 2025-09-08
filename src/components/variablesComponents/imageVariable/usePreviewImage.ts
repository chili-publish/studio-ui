import { usePreviewImageUrl as coreHook } from '@chili-publish/grafx-shared-components';
import {
    ConnectorHttpError,
    ConnectorMappingDirection,
    ConnectorStateType,
    Media,
    MediaDownloadType,
} from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useUITranslations } from 'src/core/hooks/useUITranslations';
import { useVariablesChange } from '../../../core/hooks/useVariablesChange';
import { fromLinkToVariableId, isLinkToVariable } from '../../../utils/connectors';
import { useAppDispatch } from '../../../store';
import { getCapabilitiesForConnector, selectConnectorCapabilities } from '../../../store/reducers/mediaReducer';

export const usePreviewImage = (connectorId: string | undefined, mediaAssetId: string | undefined) => {
    const { getUITranslation } = useUITranslations();
    const dispatch = useAppDispatch();

    const [mediaDetails, setMediaDetails] = useState<Media | null>(null);
    const [mediaDetailsPending, setMediaDetailsPending] = useState(false);
    const [mediaDetailsError, setMediaDetailsError] = useState<unknown | null>(null);
    const [mediaConnectorState, setMediaConnectorState] = useState<ConnectorStateType.ready | null>(null);
    const [variableIdsInMapping, setVariableIdsInMapping] = useState<Array<string>>([]);

    const { currentVariables: linkedVariables } = useVariablesChange(variableIdsInMapping);
    const connectorCapabilities = useSelector(selectConnectorCapabilities);

    const getErrorTranslation = useCallback(
        (error: unknown): string => {
            if (error instanceof ConnectorHttpError) {
                switch (error.statusCode) {
                    case 401:
                        return getUITranslation(
                            ['formBuilder', 'variables', 'imageVariable', 'errors', 'unauthorized'],
                            'Unauthorized error',
                        );
                    case 404:
                        return getUITranslation(
                            ['formBuilder', 'variables', 'imageVariable', 'errors', 'missingAsset'],
                            'Asset is missing',
                        );
                    default:
                        return getUITranslation(
                            ['formBuilder', 'variables', 'imageVariable', 'errors', 'default'],
                            'Unable to load',
                        );
                }
            }
            return getUITranslation(
                ['formBuilder', 'variables', 'imageVariable', 'errors', 'default'],
                'Unable to load',
            );
        },
        [getUITranslation],
    );

    const getMediaDetails = useCallback(async () => {
        if (!connectorId || !mediaAssetId) {
            setMediaDetails(null);
            setMediaDetailsPending(false);
            setMediaDetailsError(null);
            return null;
        }

        setMediaDetails(null);
        setMediaDetailsPending(true);
        setMediaDetailsError(null);

        try {
            let media: Media | null = null;

            if (connectorCapabilities[connectorId]?.query && connectorCapabilities[connectorId]?.filtering) {
                const { parsedData } = await window.StudioUISDK.mediaConnector.query(connectorId, {
                    filter: [mediaAssetId],
                    pageSize: 1,
                });
                media = parsedData?.data[0] ?? null;
            } else if (connectorCapabilities[connectorId]?.detail) {
                const { parsedData } = await window.StudioUISDK.mediaConnector.detail(connectorId, mediaAssetId);
                media = parsedData;
            }

            setMediaDetails(media);
            setMediaDetailsPending(false);

            // If no media details found, set error
            if (!media) {
                setMediaDetailsError(new ConnectorHttpError(404, 'Asset not found'));
            }

            return media;
        } catch (error) {
            setMediaDetails(null);
            setMediaDetailsPending(false);
            setMediaDetailsError(error);
            return null;
        }
    }, [connectorId, mediaAssetId, connectorCapabilities]);

    // Preview image URL hook - only runs when media details are available
    const previewCall = useCallback(
        async (id: string): Promise<Uint8Array | null> => {
            if (!connectorId) {
                return null;
            }
            const downloadCall = () => {
                return window.StudioUISDK.mediaConnector.download(connectorId, id, MediaDownloadType.thumbnail, {});
            };
            try {
                return await downloadCall();
            } catch (e) {
                const connectorState = await window.StudioUISDK.connector.getState(connectorId);
                if (connectorState.parsedData?.type !== 'ready') {
                    await window.StudioUISDK.connector.waitToBeReady(connectorId);
                    return downloadCall();
                }
                throw e;
            }
        },
        [connectorId],
    );

    const {
        previewImageUrl,
        pending: previewPending,
        error: previewError,
        resetError: resetPreviewError,
    } = coreHook(
        mediaDetails ? mediaAssetId : undefined, // Only fetch preview if media details exist
        previewCall,
    );

    const previewImageError = useMemo(() => {
        if (mediaDetailsError) {
            return getErrorTranslation(mediaDetailsError);
        }

        if (previewError) {
            return getErrorTranslation(previewError);
        }

        return undefined;
    }, [mediaDetailsError, previewError, getErrorTranslation]);

    const previewImage = useMemo(() => {
        if (!mediaDetails || !previewImageUrl) {
            return undefined;
        }
        return {
            id: mediaDetails.id,
            name: mediaDetails.name,
            format: mediaDetails.extension ?? '',
            url: previewImageUrl,
        };
    }, [mediaDetails, previewImageUrl]);

    const resetError = useCallback(() => {
        setMediaDetailsError(null);
        resetPreviewError();
    }, [resetPreviewError]);

    // Connector state management
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

    // Variable mappings management
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

    // Connector capabilities management
    useEffect(() => {
        (async () => {
            if (!connectorId || connectorCapabilities[connectorId] || mediaConnectorState === null) {
                return;
            }

            await dispatch(getCapabilitiesForConnector({ connectorId }));
        })();
    }, [connectorId, connectorCapabilities, mediaConnectorState, dispatch]);

    // Fetch media details when dependencies change
    useEffect(() => {
        getMediaDetails();
    }, [linkedVariables, getMediaDetails]);

    // Reset preview error when connector id changes
    useEffect(() => {
        resetPreviewError();
    }, [connectorId, resetPreviewError]);

    return {
        previewImage,
        pending: mediaDetailsPending || previewPending,
        error: previewImageError,
        resetError,
    };
};

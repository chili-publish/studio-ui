import { usePreviewImageUrl as coreHook } from '@chili-publish/grafx-shared-components';
import { ConnectorHttpError, MediaDownloadType } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';
import { ImageVariableError } from './ImageVariableError';

export const usePreviewImageUrl = (connectorId: string | undefined, mediaAssetId: string | undefined) => {
    const previewCall = useCallback(
        async (id: string) => {
            if (!connectorId) {
                return null;
            }
            const downloadCall = () => {
                return window.StudioUISDK.mediaConnector.download(connectorId, id, MediaDownloadType.thumbnail, {});
            };
            try {
                return await downloadCall();
            } catch (e) {
                if (e instanceof ConnectorHttpError) {
                    throw new ImageVariableError(e.statusCode, e.message);
                }
                const mediaConnectorState = await window.StudioUISDK.connector.getState(connectorId);
                if (mediaConnectorState.parsedData?.type !== 'ready') {
                    await window.StudioUISDK.connector.waitToBeReady(connectorId);
                    return downloadCall();
                }
                throw e;
            }
        },
        [connectorId],
    );

    return { mediaAssetId, ...coreHook(mediaAssetId, previewCall) };
};

import { usePreviewImageUrl as coreHook } from '@chili-publish/grafx-shared-components';
import { MediaDownloadType } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';

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
                const res = await downloadCall();
                return res.parsedData;
            } catch (e) {
                const mediaConnectorState = await window.StudioUISDK.connector.getState(connectorId);
                if (mediaConnectorState.parsedData?.type !== 'ready') {
                    await window.StudioUISDK.connector.waitToBeReady(connectorId);
                    return downloadCall().then((res) => res.parsedData);
                }
                throw e;
            }
        },
        [connectorId],
    );

    return coreHook(mediaAssetId, previewCall);
};

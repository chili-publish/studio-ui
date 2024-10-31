import { useCallback } from 'react';
import { MediaDownloadType } from '@chili-publish/studio-sdk';
import { usePreviewImageUrl as coreHook } from '@chili-publish/grafx-shared-components';
import { MediaRemoteConnector } from 'src/utils/ApiTypes';

export const usePreviewImageUrl = (
    connectorId: string | undefined,
    mediaAssetId: string | undefined,
    selectedConnector: MediaRemoteConnector | undefined,
) => {
    const previewCall = useCallback(
        async (id: string, retries = 3) => {
            if (!connectorId) {
                return null;
            }
            const downloadCall = (): Promise<Uint8Array> => {
                return window.StudioUISDK.mediaConnector.download(connectorId, id, MediaDownloadType.thumbnail, {});
            };
            try {
                const res = await downloadCall();
                if (
                    typeof res === 'object' &&
                    'data' in res &&
                    selectedConnector?.name === 'GraFx Media' &&
                    selectedConnector?.ownerType === 'builtIn'
                ) {
                    if (JSON.parse((res as { data: string }).data).statusCode === 202) {
                        if (retries > 0) {
                            await new Promise((resolve) => {
                                setTimeout(resolve, 1000);
                            });
                            return previewCall(id, retries - 1);
                        }
                    }
                }
                return res;
            } catch (e) {
                const mediaConnectorState = await window.StudioUISDK.connector.getState(connectorId);
                if (mediaConnectorState.parsedData?.type !== 'ready') {
                    await window.StudioUISDK.connector.waitToBeReady(connectorId);
                    return downloadCall();
                }
                return null;
            }
        },
        [connectorId, selectedConnector?.name, selectedConnector?.ownerType],
    );

    const previewImageUrl = coreHook(mediaAssetId, previewCall);

    return previewImageUrl;
};

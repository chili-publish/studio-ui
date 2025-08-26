import { usePreviewImageUrl as coreHook } from '@chili-publish/grafx-shared-components';
import { EditorResponse, MediaDownloadType } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';
import { ImageVariableError } from './ImageVariableError';

export const usePreviewImageUrl = (connectorId: string | undefined, mediaAssetId: string | undefined) => {
    const previewCall = useCallback(
        async (id: string) => {
            if (!connectorId) {
                return null;
            }
            const downloadCall = (): Promise<Uint8Array> => {
                return window.StudioUISDK.mediaConnector.download(connectorId, id, MediaDownloadType.thumbnail, {});
            };
            try {
                const res = await downloadCall();
                if ('success' in res && !res.success) {
                    const httpErrorCode = JSON.parse((res as unknown as EditorResponse<string>)?.data ?? '{}');
                    if (httpErrorCode?.statusCode)
                        throw new ImageVariableError(httpErrorCode.statusCode, httpErrorCode.error);
                }
                return res;
            } catch (e) {
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

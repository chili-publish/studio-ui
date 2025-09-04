import { usePreviewImageUrl as coreHook } from '@chili-publish/grafx-shared-components';
import { ConnectorHttpError, MediaDownloadType } from '@chili-publish/studio-sdk';
import { useCallback, useMemo } from 'react';
import { useUITranslations } from 'src/core/hooks/useUITranslations';

export const usePreviewImageUrl = (connectorId: string | undefined, mediaAssetId: string | undefined) => {
    const { getUITranslation } = useUITranslations();

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

    const { previewImageUrl, pending, error } = coreHook(mediaAssetId, previewCall);

    const previewError = useMemo(() => {
        if (!error) return undefined;

        if (error instanceof ConnectorHttpError) {
            switch (error.statusCode) {
                case 401:
                    return getUITranslation(
                        ['formBuilder', 'variables', 'imageVariable', 'errors', 'unauthorized'],
                        'Unauthorized asset',
                    );
                case 404:
                    return getUITranslation(
                        ['formBuilder', 'variables', 'imageVariable', 'errors', 'missingAsset'],
                        'Asset is missing.',
                    );
                default:
                    return getUITranslation(
                        ['formBuilder', 'variables', 'imageVariable', 'errors', 'default'],
                        'Unable to load.',
                    );
            }
        }
        return getUITranslation(['formBuilder', 'variables', 'imageVariable', 'errors', 'default'], 'Unable to load.');
    }, [error, getUITranslation]);

    return { previewImageUrl, pending, previewError };
};

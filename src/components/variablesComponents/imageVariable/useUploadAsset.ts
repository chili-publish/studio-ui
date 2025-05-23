import { Media, UploadValidationConfiguration } from '@chili-publish/studio-sdk';
import { useCallback, useState } from 'react';

export const uploadFileMimeTypes = ['image/jpg' as const, 'image/jpeg' as const, 'image/png' as const];

export const useUploadAsset = (remoteConnectorId: string | undefined, connectorId: string | undefined) => {
    const [pending, setPending] = useState(false);
    const [uploadError, setUploadError] = useState<string>();

    const upload = useCallback(
        async (
            files: File[],
            validationConfiguration: Omit<UploadValidationConfiguration, 'mimeTypes'>,
        ): Promise<Media | null> => {
            if (!remoteConnectorId || !connectorId) {
                return null;
            }
            try {
                setPending(true);
                setUploadError(undefined);
                // 1. Stage selected files
                const filePointers = await window.StudioUISDK.utils.stageFiles(files, remoteConnectorId, {
                    mimeTypes: uploadFileMimeTypes,
                    ...validationConfiguration,
                });

                // // 2. Upload files through the connector
                const { parsedData } = await window.StudioUISDK.mediaConnector.upload(connectorId, filePointers);

                return parsedData?.[0] ?? null;
            } catch (error) {
                // TODO: Implement the particular error message text in context of https://chilipublishintranet.atlassian.net/browse/WRS-2452. Error type should be exported from SDK package
                // setErrorMsg(error instanceof SDKAssetStageError ? error.message : 'Something went wrong.');
                setUploadError('Something went wrong.');
                return null;
            } finally {
                setPending(false);
            }
        },
        [connectorId, remoteConnectorId],
    );

    const resetUploadError = useCallback(() => {
        setUploadError(undefined);
    }, []);

    return {
        upload,
        pending,
        uploadError,
        resetUploadError,
    };
};

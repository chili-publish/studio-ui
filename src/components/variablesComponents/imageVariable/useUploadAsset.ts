import {
    ImageVariable,
    Media,
    UploadAssetValidationError,
    UploadAssetValidationErrorType,
    UploadValidationConfiguration,
} from '@chili-publish/studio-sdk';
import { useCallback, useState } from 'react';

export const uploadFileMimeTypes = ['image/jpg' as const, 'image/jpeg' as const, 'image/png' as const];

function getUploadError(error: UploadAssetValidationError, imageVariable: ImageVariable) {
    switch (error.type) {
        case UploadAssetValidationErrorType.minDimension:
            if (imageVariable.uploadMinWidth && imageVariable.uploadMinHeight) {
                return `The image needs to be at least ${imageVariable.uploadMinWidth}x${imageVariable.uploadMinHeight} px.`;
            }
            if (imageVariable.uploadMinWidth) {
                return `The image needs to be at least ${imageVariable.uploadMinWidth} px wide.`;
            }
            if (imageVariable.uploadMinHeight) {
                return `The image needs to be at least ${imageVariable.uploadMinHeight} px high.`;
            }
            return 'Something went wrong.';
        default:
            return 'Something went wrong.';
    }
}

export const useUploadAsset = (remoteConnectorId: string | undefined, imageVariable: ImageVariable) => {
    const [pending, setPending] = useState(false);
    const [uploadError, setUploadError] = useState<string>();

    const upload = useCallback(
        async (
            files: File[],
            validationConfiguration: Omit<UploadValidationConfiguration, 'mimeTypes'>,
        ): Promise<Media | null> => {
            if (!remoteConnectorId || !imageVariable.value?.connectorId) {
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
                const { parsedData } = await window.StudioUISDK.mediaConnector.upload(
                    imageVariable.value.connectorId,
                    filePointers,
                );

                return parsedData?.[0] ?? null;
            } catch (error) {
                if (error instanceof UploadAssetValidationError) {
                    setUploadError(getUploadError(error, imageVariable));
                } else {
                    setUploadError('Something went wrong.');
                }
                return null;
            } finally {
                setPending(false);
            }
        },
        [remoteConnectorId, imageVariable],
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

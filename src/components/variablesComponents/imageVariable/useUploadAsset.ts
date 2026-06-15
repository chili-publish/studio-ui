import {
    FilePointer,
    ImageVariable,
    Media,
    SDKUnauthorizedError,
    UploadAssetValidationError,
    UploadAssetValidationErrorType,
    UploadValidationConfiguration,
} from '@chili-publish/studio-sdk';
import { useCallback, useState } from 'react';
import { TokenService } from 'src/services/TokenService';

export const uploadFileMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/tiff'];

function getUploadError(
    error: UploadAssetValidationError,
    { uploadMinWidth, uploadMinHeight }: Pick<ImageVariable, 'uploadMinWidth' | 'uploadMinHeight'>,
) {
    switch (error.type) {
        case UploadAssetValidationErrorType.minDimension:
            if (uploadMinWidth && uploadMinHeight) {
                return `The image needs to be at least ${uploadMinWidth}x${uploadMinHeight} px.`;
            }
            if (uploadMinWidth) {
                return `The image needs to be at least ${uploadMinWidth} px wide.`;
            }
            if (uploadMinHeight) {
                return `The image needs to be at least ${uploadMinHeight} px high.`;
            }
            return 'Something went wrong.';
        default:
            return 'Something went wrong.';
    }
}

export const useUploadAsset = (remoteConnectorId: string | undefined, imageVariable: ImageVariable) => {
    const [pending, setPending] = useState(false);
    const [uploadError, setUploadError] = useState<string>();

    const stageFiles = useCallback(
        async (
            files: File[],
            validationConfiguration: Omit<UploadValidationConfiguration, 'mimeTypes'>,
        ): Promise<FilePointer[] | null> => {
            const executor = async () => {
                if (!remoteConnectorId) {
                    return null;
                }
                try {
                    return await window.StudioUISDK.utils.stageFiles(files, remoteConnectorId, {
                        mimeTypes: uploadFileMimeTypes,
                        ...validationConfiguration,
                    });
                } catch (error) {
                    if (error instanceof UploadAssetValidationError) {
                        setUploadError(
                            getUploadError(error, {
                                uploadMinWidth: imageVariable.uploadMinWidth,
                                uploadMinHeight: imageVariable.uploadMinHeight,
                            }),
                        );
                        return null;
                    }
                    throw error;
                }
            };
            try {
                return await executor();
            } catch (error) {
                if (error instanceof SDKUnauthorizedError) {
                    const tokenService = TokenService.getInstance();
                    await tokenService.refreshToken();
                    return executor();
                }
                throw error;
            }
        },
        [remoteConnectorId, imageVariable.uploadMinWidth, imageVariable.uploadMinHeight],
    );

    const upload = useCallback(
        async (
            files: File[],
            validationConfiguration: Omit<UploadValidationConfiguration, 'mimeTypes'>,
        ): Promise<Media | null> => {
            if (!imageVariable.value?.connectorId) {
                return null;
            }
            try {
                setPending(true);
                setUploadError(undefined);
                // 1. Stage selected files
                const filePointers = await stageFiles(files, validationConfiguration);
                if (!filePointers) {
                    return null;
                }

                // 2. Upload files through the connector
                const { parsedData } = await window.StudioUISDK.mediaConnector.upload(
                    imageVariable.value.connectorId,
                    filePointers,
                );

                return parsedData?.[0] ?? null;
            } catch (error) {
                setUploadError('Something went wrong.');
            } finally {
                setPending(false);
            }
            return null;
        },
        [imageVariable, stageFiles],
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

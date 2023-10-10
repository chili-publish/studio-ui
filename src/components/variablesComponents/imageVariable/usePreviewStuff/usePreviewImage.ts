/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

export function isEmpty(value: unknown) {
    return (
        value == null ||
        (Object.prototype.hasOwnProperty.call(value, 'length') && (value as unknown[] | string).length === 0) ||
        ((value as Record<string, unknown>).constructor === Object &&
            Object.keys(value as Record<string, unknown>).length === 0)
    );
}

type GenericVariableType = {
    id?: any;
    name?: any;
    value?: {
        assetId: string;
        connectorId: string;
    };
};

type GenericMediaType = {
    id?: string;
    name?: string;
    extension?: string | null;
};

type GenericPreviewImageType = { id?: string; url?: string; name?: string; format?: string | null };

function usePreviewImage(
    mediaDetails: GenericMediaType | null,
    previewCall: (id: string) => Promise<Uint8Array | null>,
    isPanelOpen: boolean,
    variableAssetId: string,
    variableName: string,
    defaultImageFormat = 'PNG',
) {
    const [previewImage, setPreviewImage] = useState<GenericPreviewImageType>();

    // This useEffect decodes the image previews inside the ImagePicker
    useEffect(() => {
        if (!isPanelOpen) return;
        if (isEmpty(mediaDetails)) return;

        const getPreviewCall = async (assetId: string) => {
            // eslint-disable-next-line no-extra-boolean-cast
            if (!!previewCall) {
                const response = await previewCall(assetId);
                return response;
            }
            return null;
        };

        const setPreview = async () => {
            let url: string;

            if (variableAssetId) {
                const response = await getPreviewCall(variableAssetId);
                if (response instanceof Uint8Array) {
                    const blob = new Blob([response]);
                    url = URL.createObjectURL(blob);
                }
            }

            return setPreviewImage((foundPreviewImage) => {
                let updatedPreviewImage;

                // If image was removed from imagePicker and later reassigned.
                if (url) {
                    return {
                        id: mediaDetails?.id,
                        name: mediaDetails?.name,
                        format: mediaDetails?.extension?.toUpperCase() || defaultImageFormat,
                        url,
                    };
                }

                if (!url) {
                    return undefined;
                }

                // Do not show imagePreview if `value` property is missing (the image was removed).
                if (!variableAssetId) {
                    updatedPreviewImage = undefined;
                } else {
                    // Update the imagePreview with the correct values and add fallbacks. This means, that
                    // the imagePreview got its URL updated (new image was assigned). If image name is not accessible
                    // fallback to the variable name. If the format is not accessible,
                    // fallback to the defaultImageFormat - PNG. This will be fixed later.
                    updatedPreviewImage = {
                        ...foundPreviewImage,
                        name: foundPreviewImage?.name ?? variableName,
                        format: foundPreviewImage?.format ?? defaultImageFormat,
                        url,
                    };
                }
                return updatedPreviewImage;
            });
        };

        if (!variableAssetId) {
            setPreviewImage(undefined);
            return;
        }
        setPreview();
        // After successful API call to change the image, the Variable `src` property
        // should be then changed, allowing for this useEffect to be fired once again.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPanelOpen, variableAssetId, variableName, mediaDetails?.id]);

    return {
        previewImage,
    };
}

export default usePreviewImage;

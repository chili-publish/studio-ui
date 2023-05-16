import { useEffect, useState } from 'react';
import {
    ImageVariableSourceType,
    Media,
    Variable,
    MediaConnectorImageVariableSource,
    ImageVariable,
    UrlImageVariableSource,
} from '@chili-publish/studio-sdk';

const DEFAULT_IMAGE_FORMAT = 'PNG';

export const usePreviewImages = (
    mediaConnector: string,
    settingsPanelOpen: boolean,
    previewCall: (id: string) => Promise<Uint8Array>,
    selectedImage?: Media,
    currentVariable?: Variable,
) => {
    // We are storing previewImages as an array in order to remember the new previewImage name
    // when the different `currentVariable` is selected.
    const [previewImages, setPreviewImages] = useState<
        { id?: string; url?: string; name?: string; format?: string | null }[]
    >([]);
    const currentPreviewImage = previewImages?.find((img) => img.id === currentVariable?.id);

    const handleUpdateImagePreview = () => {
        setPreviewImages((prevImages) => {
            const foundPreviewImage = prevImages?.find((img) => img?.id === currentVariable?.id);
            let updatedPreviewImage;

            // If previewImage exist in the `previewImages`, update it with the
            // new name and format taken from the Media element. This should be changed later.
            if (foundPreviewImage) {
                updatedPreviewImage = {
                    ...foundPreviewImage,
                    format: selectedImage?.extension?.toUpperCase(),
                    name: selectedImage?.name,
                };

                return [...prevImages.filter((img) => img.id !== currentVariable?.id), updatedPreviewImage];
            }

            // Otherwise, add the image to the `previewImages` array without. The image URL property
            // will be added via useEffect below, as it is taken from the updated Variable.
            updatedPreviewImage = {
                id: currentVariable?.id,
                format: selectedImage?.extension?.toUpperCase(),
                name: selectedImage?.name,
            };
            return [...prevImages, updatedPreviewImage];
        });
    };

    // This useEffect decodes the image previews inside the ImagePicker
    useEffect(() => {
        if (!settingsPanelOpen) return;

        const getPreviewCall = async (assetId: string) => {
            if (previewCall) {
                const response = await previewCall(assetId);
                return response;
            }
            return null;
        };

        const setPreview = async () => {
            let url: string;

            const { parsedData: mediaInformation } = await window.SDK.mediaConnector.detail(
                mediaConnector,
                ((currentVariable as ImageVariable)?.src as MediaConnectorImageVariableSource)?.assetId,
            );

            if ((currentVariable as ImageVariable)?.src?.sourceType === ImageVariableSourceType.mediaConnector) {
                const response = await getPreviewCall(
                    ((currentVariable as ImageVariable)?.src as MediaConnectorImageVariableSource)?.assetId,
                );
                if (response instanceof Uint8Array) {
                    const blob = new Blob([response]);
                    url = URL.createObjectURL(blob);
                }
            }

            if ((currentVariable as ImageVariable)?.src?.sourceType === ImageVariableSourceType.url) {
                url = ((currentVariable as ImageVariable)?.src as UrlImageVariableSource)?.url;
            }

            return setPreviewImages((prevImages) => {
                const foundPreviewImage = prevImages?.find((img) => img?.id === currentVariable?.id);
                let updatedPreviewImage;

                // If image was removed from imagePicker and later reassigned.
                if (!foundPreviewImage && url) {
                    updatedPreviewImage = {
                        id: currentVariable?.id,
                        name: mediaInformation?.name ?? currentVariable?.name,
                        format: mediaInformation?.extension?.toUpperCase() ?? DEFAULT_IMAGE_FORMAT,
                        url,
                    };
                    return [...prevImages, updatedPreviewImage];
                }

                if (!foundPreviewImage && !url) {
                    updatedPreviewImage = {};
                    return [...prevImages, updatedPreviewImage];
                }

                // Do not show imagePreview if `src` property is missing (the image was removed).
                if (!(currentVariable as ImageVariable)?.src) {
                    updatedPreviewImage = {};
                } else {
                    // Update the imagePreview with the correct values and add fallbacks. This means, that
                    // the imagePreview got its URL updated (new image was assigned).  If image name is not accessible
                    // fallback to the variable name. If the format is not accessible,
                    // fallback to the DEFAULT_IMAGE_FORMAT - PNG. This will be fixed later.
                    updatedPreviewImage = {
                        ...foundPreviewImage,
                        name: foundPreviewImage?.name ?? currentVariable?.name,
                        format: foundPreviewImage?.format ?? DEFAULT_IMAGE_FORMAT,
                        url,
                    };
                }

                return [...prevImages.filter((img) => img.id !== currentVariable?.id), updatedPreviewImage];
            });
        };

        if (!(currentVariable as ImageVariable)?.src) {
            setPreviewImages((prevImages) => [...prevImages.filter((img) => img.id !== currentVariable?.id), {}]);
            return;
        }
        setPreview();
        // After successful API call to change the image, the Variable `src` property
        // should be then changed, allowing for this useEffect to be fired once again.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settingsPanelOpen, currentVariable]);

    return {
        currentPreviewImage,
        handleUpdateImagePreview,
    };
};

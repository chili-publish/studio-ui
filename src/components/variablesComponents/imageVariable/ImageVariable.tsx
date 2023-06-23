import { useEffect, useState } from 'react';
import {
    ImageVariable,
    Media,
    MediaConnectorImageVariableSource,
    ImageVariableSourceType,
    MediaDownloadType,
} from '@chili-publish/studio-sdk';
import { ImagePicker, Label, usePreviewImages } from '@chili-publish/grafx-shared-components';
import { IImageVariable } from '../VariablesComponents.types';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';

function ImageVariable(props: IImageVariable) {
    const { variable, handleImageRemove } = props;
    const [selectedImage] = useState<Media>();
    const mediaConnector = process.env.DEFAULT_MEDIA_CONNECTOR || '';
    const previewErrorUrl = process.env.PREVIEW_ERROR_URL || '';
    const [mediaInformation, setMediaInformation] = useState<Media | null>(null);
    const { showImagePanel } = useVariablePanelContext();

    const previewCall = async (id: string) => {
        const mediaConnectorState = await window.SDK.connector.getById(mediaConnector);
        let response = { success: true };
        if (mediaConnectorState.parsedData?.type !== 'ready') {
            response = await window.SDK.connector.waitToBeReady(mediaConnector);
        }
        if (response.success) {
            return window.SDK.mediaConnector.download(mediaConnector, id, MediaDownloadType.LowResolutionWeb, {});
        }
        return null;
    };

    useEffect(() => {
        async function getImagePreview() {
            if ((variable as ImageVariable)?.src) {
                const mediaConnectorState = await window.SDK.connector.getById(mediaConnector);
                if (mediaConnectorState.parsedData?.type !== 'ready') {
                    await window.SDK.connector.waitToBeReady(mediaConnector);
                }
                const { parsedData } = await window.SDK.mediaConnector.detail(
                    mediaConnector,
                    ((variable as ImageVariable)?.src as MediaConnectorImageVariableSource)?.assetId,
                );

                setMediaInformation(parsedData);
            }
        }

        getImagePreview();
    }, [variable, mediaConnector]);

    const { currentPreviewImage } = usePreviewImages(
        mediaInformation,
        ImageVariableSourceType,
        previewCall,
        true,
        selectedImage,
        variable,
        'PNG',
    );

    return (
        <ImagePicker
            name={variable.id}
            label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
            previewImage={currentPreviewImage}
            onRemove={() => handleImageRemove()}
            onClick={() => {
                showImagePanel(variable.id);
            }}
            previewErrorUrl={previewErrorUrl}
        />
    );
}

export default ImageVariable;

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
import { useTrayAndLeftPanelContext } from '../../../contexts/TrayAndLeftPanelContext';

function ImageVariable(props: IImageVariable) {
    const { variable, handleImageRemove } = props;
    const [selectedImage] = useState<Media>();
    const mediaConnector = process.env.DEFAULT_MEDIA_CONNECTOR || '';
    const previewErrorUrl = process.env.PREVIEW_ERROR_URL || '';
    const [mediaInformation, setMediaInformation] = useState<Media | null>(null);
    const { showImagePanel } = useTrayAndLeftPanelContext();

    const previewCall = async (id: string) => {
        const mediaConnectorState = await window.SDK.connector.getState(mediaConnector);
        if (mediaConnectorState.parsedData?.type !== 'ready') {
            await window.SDK.connector.waitForConnectorReady(mediaConnector);
        }
        return window.SDK.mediaConnector.download(mediaConnector, id, MediaDownloadType.LowResolutionWeb, {});
    };

    useEffect(() => {
        async function getImagePreview() {
            const { parsedData } = await window.SDK.mediaConnector.detail(
                mediaConnector,
                ((variable as ImageVariable)?.src as MediaConnectorImageVariableSource)?.assetId,
            );

            setMediaInformation(parsedData);
        }

        getImagePreview();
    }, [variable, mediaConnector]);

    const { currentPreviewImage: currentPreviewImage2 } = usePreviewImages(
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
            previewImage={currentPreviewImage2}
            onRemove={() => handleImageRemove()}
            onClick={() => {
                showImagePanel(variable.id);
            }}
            previewErrorUrl={previewErrorUrl}
        />
    );
}

export default ImageVariable;

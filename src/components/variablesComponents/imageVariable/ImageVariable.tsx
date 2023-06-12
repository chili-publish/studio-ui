import { useState } from 'react';
import { Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { ImagePicker, Label } from '@chili-publish/grafx-shared-components';
import { usePreviewImages } from './usePreviewImage';
import { IImageVariable } from '../VariablesComponents.types';

function ImageVariable(props: IImageVariable) {
    const { variable, handleImageRemove } = props;
    const [selectedImage] = useState<Media>();
    const mediaConnector = process.env.DEFAULT_MEDIA_CONNECTOR || '';
    const previewErrorUrl = process.env.PREVIEW_ERROR_URL || '';

    const previewCall = (id: string): Promise<Uint8Array> =>
        window.SDK.mediaConnector.download(mediaConnector, id, MediaDownloadType.LowResolutionWeb, {});

    const { currentPreviewImage } = usePreviewImages(mediaConnector, true, previewCall, selectedImage, variable);
    return (
        <ImagePicker
            name={variable.id}
            label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
            previewImage={currentPreviewImage}
            onRemove={handleImageRemove}
            // TODO: replace with the action that opens the assets panel
            onClick={() => null}
            previewErrorUrl={previewErrorUrl}
        />
    );
}

export default ImageVariable;

import { useState } from 'react';
import { Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { ImagePicker, Label } from '@chili-publish/grafx-shared-components';
import { usePreviewImages } from './usePreviewImage';
import { IImageVariable } from '../VariablesComponents.types';

function ImageVariable(props: IImageVariable) {
    const { variable, handleImageRemove } = props;
    const [selectedImage] = useState<Media>();

    const previewCall = (id: string): Promise<Uint8Array> =>
        window.SDK.mediaConnector.download(
            import.meta.env.VITE_DEFAULT_MEDIA_CONNECTOR,
            id,
            MediaDownloadType.LowResolutionWeb,
            {},
        );

    const { currentPreviewImage } = usePreviewImages(
        import.meta.env.VITE_DEFAULT_MEDIA_CONNECTOR,
        import.meta.env.VITE_PREVIEW_ERROR_URL,
        true,
        previewCall,
        selectedImage,
        variable,
    );
    return (
        <ImagePicker
            name={variable.id}
            label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
            previewImage={currentPreviewImage}
            onRemove={handleImageRemove}
            // TODO: replace with the action that opens the assets panel
            // eslint-disable-next-line no-console
            onClick={() => console.log('open assets panel')}
            previewErrorUrl={import.meta.env.VITE_PREVIEW_ERROR_URL}
        />
    );
}

export default ImageVariable;

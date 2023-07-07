import { useEffect, useState } from 'react';
import {
    ImageVariable,
    Media,
    MediaConnectorImageVariableSource,
    ImageVariableSourceType,
    MediaDownloadType,
} from '@chili-publish/studio-sdk';
import { ImagePicker, Label, usePreviewImage } from '@chili-publish/grafx-shared-components';
import { IImageVariable } from '../VariablesComponents.types';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';

function ImageVariable(props: IImageVariable) {
    const { variable, handleImageRemove } = props;
    const mediaConnector = process.env.DEFAULT_MEDIA_CONNECTOR || '';
    const previewErrorUrl = process.env.PREVIEW_ERROR_URL || '';
    const [mediaDetails, setMediaDetails] = useState<Media | null>(null);
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
        async function getMediaDetails() {
            if ((variable as ImageVariable)?.src) {
                const mediaConnectorState = await window.SDK.connector.getById(mediaConnector);
                if (mediaConnectorState.parsedData?.type !== 'ready') {
                    await window.SDK.connector.waitToBeReady(mediaConnector);
                }
                const { parsedData } = await window.SDK.mediaConnector.detail(
                    mediaConnector,
                    ((variable as ImageVariable)?.src as MediaConnectorImageVariableSource)?.assetId,
                );

                setMediaDetails(parsedData);
            }
        }

        getMediaDetails();
    }, [variable, mediaConnector]);

    const { previewImage } = usePreviewImage(mediaDetails, ImageVariableSourceType, previewCall, true, variable);

    return (
        <ImagePicker
            name={variable.id}
            dataId={getDataIdForSUI('image-picker')}
            dataTestId={getDataTestIdForSUI('image-picker')}
            label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
            previewImage={previewImage}
            onRemove={() => handleImageRemove()}
            onClick={() => {
                showImagePanel(variable.id);
            }}
            previewErrorUrl={previewErrorUrl}
        />
    );
}

export default ImageVariable;

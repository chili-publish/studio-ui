import { useEffect, useState } from 'react';
import { ImageVariable, Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { ImagePicker, Label, usePreviewImage } from '@chili-publish/grafx-shared-components';
import { IImageVariable } from '../VariablesComponents.types';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';

function ImageVariable(props: IImageVariable) {
    const { variable, handleImageRemove } = props;
    const previewErrorUrl = process.env.PREVIEW_ERROR_URL ?? '';
    const [mediaDetails, setMediaDetails] = useState<Media | null>(null);
    const { showImagePanel, defaultMediaConnector, connectorCapabilities } = useVariablePanelContext();

    const previewCall = async (id: string) => {
        const mediaConnectorState = await window.SDK.connector.getState(defaultMediaConnector?.id);
        let response = { success: true };
        if (mediaConnectorState.parsedData?.type !== 'ready') {
            response = await window.SDK.connector.waitToBeReady(defaultMediaConnector?.id);
        }
        if (response.success) {
            return window.SDK.mediaConnector.download(
                defaultMediaConnector?.id,
                id,
                MediaDownloadType.LowResolutionWeb,
                {},
            );
        }
        return null;
    };

    useEffect(() => {
        async function getMediaDetails() {
            if ((variable as ImageVariable)?.value && defaultMediaConnector?.id) {
                const mediaConnectorState = await window.SDK.connector.getState(defaultMediaConnector.id);
                if (mediaConnectorState.parsedData?.type !== 'ready') {
                    await window.SDK.connector.waitToBeReady(defaultMediaConnector.id);
                }
                if (
                    connectorCapabilities[defaultMediaConnector.id] &&
                    connectorCapabilities[defaultMediaConnector.id].detail
                ) {
                    const { parsedData } = await window.SDK.mediaConnector.detail(
                        defaultMediaConnector?.id,
                        (variable as ImageVariable).value?.assetId as string,
                    );

                    setMediaDetails(parsedData);
                }
            }
        }

        getMediaDetails();
    }, [variable, defaultMediaConnector?.id, connectorCapabilities]);

    const { previewImage } = usePreviewImage(mediaDetails, previewCall, true, variable);

    return (
        <ImagePicker
            dataId={getDataIdForSUI(`img-picker-${variable.id}`)}
            dataTestId={getDataTestIdForSUI(`img-picker-${variable.id}`)}
            name={variable.id}
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

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
    const { showImagePanel, connectorCapabilities, getCapabilitiesForConnector } = useVariablePanelContext();

    const previewCall = async (id: string) => {
        const mediaConnectorState = await window.SDK.connector.getState(variable.value?.connectorId ?? '');
        let response = { success: true };
        if (mediaConnectorState.parsedData?.type !== 'ready') {
            response = await window.SDK.connector.waitToBeReady(variable.value?.connectorId ?? '');
        }
        if (response.success) {
            return window.SDK.mediaConnector.download(
                variable.value?.connectorId ?? '',
                id,
                MediaDownloadType.LowResolutionWeb,
                {},
            );
        }
        return null;
    };

    useEffect(() => {
        async function getMediaDetails() {
            if (!variable.value || !variable.value.connectorId) return;

            const mediaConnectorState = await window.SDK.connector.getState(variable.value.connectorId);
            if (mediaConnectorState.parsedData?.type !== 'ready') {
                await window.SDK.connector.waitToBeReady(variable.value.connectorId ?? '');
            }
            if (
                !connectorCapabilities[variable.value.connectorId] ||
                !connectorCapabilities[variable.value.connectorId].detail
            ) {
                getCapabilitiesForConnector(variable.value.connectorId);
            }

            const { parsedData } = await window.SDK.mediaConnector.detail(
                variable.value.connectorId,
                variable.value.assetId as string,
            );

            setMediaDetails(parsedData);
        }

        getMediaDetails();
    }, [variable, connectorCapabilities, getCapabilitiesForConnector]);

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
                showImagePanel(variable as ImageVariable);
            }}
            previewErrorUrl={previewErrorUrl}
        />
    );
}

export default ImageVariable;

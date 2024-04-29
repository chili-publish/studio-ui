import { ImagePicker, Label, usePreviewImage } from '@chili-publish/grafx-shared-components';
import { Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { useEffect, useState } from 'react';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import { IImageVariable } from '../VariablesComponents.types';

function ImageVariable(props: IImageVariable) {
    const { variable, handleImageRemove } = props;
    const previewErrorUrl = process.env.PREVIEW_ERROR_URL ?? '';
    const [mediaDetails, setMediaDetails] = useState<Media | null>(null);
    const { showImagePanel, connectorCapabilities, getCapabilitiesForConnector } = useVariablePanelContext();

    const previewCall = async (id: string) => {
        let response = { success: true };
        const downloadCall = async () => {
            return window.SDK.mediaConnector.download(
                variable.value?.connectorId ?? '',
                id,
                MediaDownloadType.thumbnail,
                {},
            );
        };
        try {
            return downloadCall();
        } catch {
            const mediaConnectorState = await window.SDK.connector.getState(variable.value?.connectorId ?? '');
            if (mediaConnectorState.parsedData?.type !== 'ready') {
                response = await window.SDK.connector.waitToBeReady(variable.value?.connectorId ?? '');
            }
            if (response.success) {
                return downloadCall();
            }
            return null;
        }
    };

    useEffect(() => {
        async function getMediaDetails() {
            if (!variable.value || !variable.value.connectorId) return;

            const mediaConnectorState = await window.SDK.connector.getState(variable.value.connectorId);
            if (mediaConnectorState.parsedData?.type !== 'ready') {
                await window.SDK.connector.waitToBeReady(variable.value.connectorId);
            }
            if (!connectorCapabilities[variable.value.connectorId]) {
                try {
                    await getCapabilitiesForConnector(variable.value.connectorId);
                } catch (e) {
                    return;
                }
            }

            if (!variable.value.resolved?.mediaId && !variable.value.assetId) return;
            const { parsedData, success } = await window.SDK.mediaConnector.detail(
                variable.value.connectorId,
                variable.value.resolved?.mediaId ?? (variable.value.assetId as string),
            );
            if (!success) return;
            setMediaDetails(parsedData);
        }

        getMediaDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [variable, getCapabilitiesForConnector]);

    const { previewImage } = usePreviewImage(mediaDetails, previewCall, true, variable);

    return (
        <ImagePicker
            dataId={getDataIdForSUI(`img-picker-${variable.id}`)}
            dataTestId={getDataTestIdForSUI(`img-picker-${variable.id}`)}
            dataIntercomId={`image-picker-${variable.name}`}
            name={variable.id}
            label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
            previewImage={previewImage}
            onRemove={() => handleImageRemove()}
            onClick={() => {
                showImagePanel(variable);
            }}
            previewErrorUrl={previewErrorUrl}
        />
    );
}

export default ImageVariable;

import { ImagePicker, Label } from '@chili-publish/grafx-shared-components';
import { ImageVariable, Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useState } from 'react';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import { IImageVariable } from '../VariablesComponents.types';
import usePreviewImage from './usePreviewStuff/usePreviewImage';

function ImageVariable(props: IImageVariable) {
    const { variable, handleImageRemove } = props;
    const previewErrorUrl = process.env.PREVIEW_ERROR_URL ?? '';
    const [mediaDetails, setMediaDetails] = useState<Media | null>(null);
    const { showImagePanel, connectorCapabilities, getCapabilitiesForConnector } = useVariablePanelContext();

    const previewCall = useCallback(async (id: string) => {
        let response = { success: true };
        const downloadCall = async () => {
            return window.SDK.mediaConnector.download(
                variable.value?.connectorId ?? '',
                id,
                MediaDownloadType.LowResolutionWeb,
                {},
            );
        };
        try {
            console.log('previewCall');
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
    }, []);

    useEffect(() => {
        console.log('useEffect');
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

            const { parsedData, success } = await window.SDK.mediaConnector.detail(
                variable.value.connectorId,
                variable.value.assetId as string,
            );
            if (!success) return;
            setMediaDetails(parsedData);
        }

        getMediaDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { previewImage } = usePreviewImage(
        mediaDetails,
        previewCall,
        true,
        variable.value?.assetId ?? '',
        variable.name,
    );

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

import { ImagePicker, Label, usePreviewImageUrl } from '@chili-publish/grafx-shared-components';
import { Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import { IImageVariable } from '../VariablesComponents.types';
import { isAuthenticationRequired, verifyAuthentication } from '../../../utils/connectors';
import { useVariableConnector } from './useVariableConnector';

function ImageVariable(props: IImageVariable) {
    const { variable, handleImageRemove } = props;
    const [mediaDetails, setMediaDetails] = useState<Media | null>(null);
    const { selectedConnector } = useVariableConnector(variable);
    const { showImagePanel, connectorCapabilities, getCapabilitiesForConnector } = useVariablePanelContext();

    const mediaAssetId = useMemo(() => {
        return variable.value?.resolved?.mediaId ?? variable?.value?.assetId;
    }, [variable.value?.resolved?.mediaId, variable.value?.assetId]);

    const previewCall = useCallback(
        async (id: string) => {
            let response = { success: false };
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
        },
        [variable.value?.connectorId],
    );

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

    const previewImageUrl = usePreviewImageUrl(mediaAssetId, previewCall);

    const previewImage = useMemo(() => {
        if (!mediaDetails || !previewImageUrl) {
            return undefined;
        }
        return {
            id: mediaDetails.id,
            name: mediaDetails.name,
            format: mediaDetails.extension ?? '',
            url: previewImageUrl,
        };
    }, [mediaDetails, previewImageUrl]);

    return (
        <ImagePicker
            dataId={getDataIdForSUI(`img-picker-${variable.id}`)}
            dataTestId={getDataTestIdForSUI(`img-picker-${variable.id}`)}
            dataIntercomId={`image-picker-${variable.name}`}
            id={variable.id}
            label={<Label translationKey={variable.name} value={variable.name} />}
            placeholder="Select image"
            errorMsg="Something went wrong. Please try again"
            previewImage={previewImage}
            onRemove={() => handleImageRemove()}
            onBrowse={async () => {
                if (!selectedConnector) {
                    throw new Error('There is no selected connector');
                }
                try {
                    if (variable.value?.connectorId && isAuthenticationRequired(selectedConnector)) {
                        await verifyAuthentication(variable.value.connectorId);
                    }
                    showImagePanel(variable);
                } catch (error) {
                    // TODO: We should handle connector's authorization issue accordingly
                    // eslint-disable-next-line no-console
                    console.error(error);
                }
            }}
        />
    );
}

export default ImageVariable;

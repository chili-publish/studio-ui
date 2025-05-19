import { ImagePicker, InputLabel, Label } from '@chili-publish/grafx-shared-components';
import { useMemo } from 'react';
import { useFeatureFlagContext } from '../../../contexts/FeatureFlagProvider';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { isAuthenticationRequired, verifyAuthentication } from '../../../utils/connectors';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import { HelpTextWrapper } from '../VariablesComponents.styles';
import { IImageVariable } from '../VariablesComponents.types';
import { getImageVariablePlaceholder } from '../variablePlaceholder.util';
import { useMediaDetails } from './useMediaDetails';
import { usePreviewImageUrl } from './usePreviewImageUrl';
import { uploadFileMimeTypes, useUploadAsset } from './useUploadAsset';
import { useVariableConnector } from './useVariableConnector';

function ImageVariable(props: IImageVariable) {
    const { variable, validationError, handleImageRemove, handleImageChange } = props;
    const { onVariableFocus, onVariableBlur } = useUiConfigContext();
    const { featureFlags } = useFeatureFlagContext();
    const isImageUploadEnabled = featureFlags?.studioImageUpload;

    const placeholder = getImageVariablePlaceholder(variable);

    const { remoteConnector } = useVariableConnector(variable);

    const { showImagePanel } = useVariablePanelContext();

    const mediaAssetId = useMemo(() => {
        return variable.value?.resolved?.mediaId ?? variable?.value?.assetId;
    }, [variable.value?.resolved?.mediaId, variable.value?.assetId]);

    const { previewImageUrl, pending: previewPending } = usePreviewImageUrl(variable.value?.connectorId, mediaAssetId);
    const mediaDetails = useMediaDetails(variable.value?.connectorId, mediaAssetId);
    const {
        upload,
        pending: uploadPending,
        errorMsg,
    } = useUploadAsset(remoteConnector?.id, variable.value?.connectorId);

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

    const handleImageUpload = async (files: FileList | null) => {
        if (!files) {
            return;
        }
        onVariableFocus?.(variable.id);
        upload([...files], {
            minWidthPixels: variable.uploadMinWidth,
            minHeightPixels: variable.uploadMinHeight,
        }).then((media) => {
            if (!media) {
                return;
            }
            handleImageChange?.({ assetId: media.id, id: variable.id });
            onVariableBlur?.(variable.id);
        });
    };

    const handleImageBrowse = async () => {
        if (!remoteConnector) {
            throw new Error('There is no remote connector for defined image variable');
        }
        try {
            if (variable.value?.connectorId && isAuthenticationRequired(remoteConnector)) {
                await verifyAuthentication(variable.value.connectorId);
            }
            onVariableFocus?.(variable.id);
            showImagePanel(variable);
        } catch (error) {
            // TODO: We should handle connector's authorization issue accordingly
            // eslint-disable-next-line no-console
            console.error(error);
        }
    };

    const onRemove = () => {
        handleImageRemove();
        onVariableFocus?.(variable.id);
        onVariableBlur?.(variable.id);
    };

    // Calculate pending state
    const isPending = previewPending || uploadPending;

    // Determine if any operations are allowed based on feature flags
    const allowQuery = isImageUploadEnabled ? variable.allowQuery : true;
    const allowUpload = isImageUploadEnabled ? variable.allowUpload : false;

    // If no operations are allowed, don't render the component
    if (!allowQuery && !allowUpload) {
        return null;
    }

    return (
        <HelpTextWrapper>
            <ImagePicker
                dataId={getDataIdForSUI(`img-picker-${variable.id}`)}
                dataTestId={getDataTestIdForSUI(`img-picker-${variable.id}`)}
                dataIntercomId={`image-picker-${variable.name}`}
                id={variable.id}
                label={
                    <Label translationKey={variable.label ?? variable.name} value={variable.label ?? variable.name} />
                }
                required={variable.isRequired}
                placeholder={placeholder}
                errorMsg="Something went wrong. Please try again"
                previewImage={previewImage}
                validationErrorMessage={validationError || errorMsg}
                onRemove={onRemove}
                pending={isPending}
                uploadFilesFormat={uploadFileMimeTypes.join(', ')}
                onBrowse={allowQuery ? handleImageBrowse : undefined}
                onUpload={allowUpload ? handleImageUpload : undefined}
            />
            {variable.helpText && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
}

export default ImageVariable;

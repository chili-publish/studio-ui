import { ImagePicker, InputLabel, Label } from '@chili-publish/grafx-shared-components';
import { useMemo } from 'react';
import { selectImageChangePendingId, setImageChangePendingId } from 'src/store/reducers/variableReducer';
import { useSelector } from 'react-redux';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import { isAuthenticationRequired, verifyAuthentication } from '../../../utils/connectors';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import { HelpTextWrapper } from '../VariablesComponents.styles';
import { IImageVariable } from '../VariablesComponents.types';
import { getImageVariablePendingLabel, getImageVariablePlaceholder } from '../variablePlaceholder.util';
import { usePreviewImage } from './usePreviewImage';
import { uploadFileMimeTypes, useUploadAsset } from './useUploadAsset';
import { useVariableConnector } from './useVariableConnector';
import { useAppDispatch } from '../../../store';
import { showImagePanel } from '../../../store/reducers/panelReducer';

function ImageVariable(props: IImageVariable) {
    const { variable, validationError, handleImageRemove, handleImageChange } = props;

    const { onVariableFocus, onVariableBlur } = useUiConfigContext();

    const dispatch = useAppDispatch();
    const placeholder = getImageVariablePlaceholder(variable);
    const imageChangePendingId = useSelector(selectImageChangePendingId);

    const { remoteConnector } = useVariableConnector(variable);

    const mediaAssetId = useMemo(() => {
        return variable.value?.resolved?.mediaId ?? variable?.value?.assetId;
    }, [variable.value?.resolved?.mediaId, variable.value?.assetId]);

    const {
        previewImage,
        pending: mediaPending,
        error: mediaError,
        resetError: resetMediaError,
    } = usePreviewImage(variable.value?.connectorId, mediaAssetId);
    const {
        upload,
        pending: uploadPending,
        uploadError,
        resetUploadError,
    } = useUploadAsset(remoteConnector?.id, variable);

    const pendingLabel = getImageVariablePendingLabel(uploadPending);

    const handleImageUpload = async (files: FileList | null) => {
        if (!files?.length) {
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
            dispatch(setImageChangePendingId(variable.id));
            handleImageChange({ assetId: media.id, id: variable.id, context: { searchInUploadFolder: true } });
            onVariableBlur?.(variable.id);
        });
    };

    const handleImageBrowse = async () => {
        if (!remoteConnector) {
            throw new Error('There is no remote connector for defined image variable');
        }
        resetUploadError();
        try {
            if (variable.value?.connectorId && isAuthenticationRequired(remoteConnector)) {
                await verifyAuthentication(variable.value.connectorId);
            }
            onVariableFocus?.(variable.id);
            dispatch(showImagePanel({ variableId: variable.id, connectorId: variable.value?.connectorId ?? '' }));
        } catch (error) {
            // TODO: We should handle connector's authorization issue accordingly
            // eslint-disable-next-line no-console
            console.error(error);
        }
    };

    const onRemove = () => {
        resetUploadError();
        resetMediaError();
        handleImageRemove();
        onVariableFocus?.(variable.id);
        onVariableBlur?.(variable.id);
    };

    // Calculate pending state
    const isPending = mediaPending || uploadPending || variable.id === imageChangePendingId;

    const errorMessage = uploadError || validationError || mediaError;

    // If no operations are allowed, don't render the component
    if (!variable.allowQuery && !variable.allowUpload) {
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
                loadPreviewImageErrorMessage="Something went wrong. Please try again"
                previewImage={previewImage}
                errorMessage={errorMessage}
                onRemove={onRemove}
                pending={isPending}
                pendingLabel={pendingLabel}
                uploadFilesFormat={uploadFileMimeTypes.join(', ')}
                onBrowse={variable.allowQuery ? handleImageBrowse : undefined}
                onUpload={variable.allowUpload ? handleImageUpload : undefined}
            />
            {variable.helpText && !errorMessage ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
}

export default ImageVariable;

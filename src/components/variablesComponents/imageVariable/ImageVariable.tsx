import { ImagePicker, InputLabel, Label } from '@chili-publish/grafx-shared-components';
import { useMemo } from 'react';
import { useFeatureFlagContext } from '../../../contexts/FeatureFlagProvider';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import { IImageVariable } from '../VariablesComponents.types';
import { isAuthenticationRequired, verifyAuthentication } from '../../../utils/connectors';
import { useVariableConnector } from './useVariableConnector';
import { usePreviewImageUrl } from './usePreviewImageUrl';
import { useMediaDetails } from './useMediaDetails';
import { HelpTextWrapper } from '../VariablesComponents.styles';
import { getVariablePlaceholder } from '../variablePlaceholder.util';

function ImageVariable(props: IImageVariable) {
    const { variable, validationError, handleImageRemove } = props;
    const { featureFlags } = useFeatureFlagContext();

    const placeholder = getVariablePlaceholder(variable);

    const { selectedConnector } = useVariableConnector(variable);

    const { showImagePanel } = useVariablePanelContext();

    const mediaAssetId = useMemo(() => {
        return variable.value?.resolved?.mediaId ?? variable?.value?.assetId;
    }, [variable.value?.resolved?.mediaId, variable.value?.assetId]);

    const previewImageUrl = usePreviewImageUrl(variable.value?.connectorId, mediaAssetId, selectedConnector);
    const mediaDetails = useMediaDetails(variable.value?.connectorId, mediaAssetId);

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
        <HelpTextWrapper>
            <ImagePicker
                dataId={getDataIdForSUI(`img-picker-${variable.id}`)}
                dataTestId={getDataTestIdForSUI(`img-picker-${variable.id}`)}
                dataIntercomId={`image-picker-${variable.name}`}
                id={variable.id}
                label={
                    <Label
                        translationKey={featureFlags?.STUDIO_LABEL_PROPERTY_ENABLED ? variable.label : variable.name}
                        value={featureFlags?.STUDIO_LABEL_PROPERTY_ENABLED ? variable.label : variable.name}
                    />
                }
                required={variable.isRequired}
                placeholder={placeholder}
                errorMsg="Something went wrong. Please try again"
                previewImage={previewImage}
                onRemove={handleImageRemove}
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
                validationErrorMessage={validationError}
            />
            {variable.helpText && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
}

export default ImageVariable;

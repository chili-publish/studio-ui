import { ImageVariable, Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { convertToPreviewType } from '../../utils/mediaUtils';
import ItemBrowser from '../itemBrowser/ItemBrowser';
import { useUiConfigContext } from '../../contexts/UiConfigContext';
import { showVariablesPanel } from '../../store/reducers/panelReducer';
import { useAppDispatch } from '../../store';
import {
    selectCurrentVariableConnectorId,
    selectCurrentVariableId,
    selectVariables,
    validateVariable,
} from '../../store/reducers/variableReducer';
import { useVariableComponents } from '../variablesComponents/useVariablesComponents';

function ImagePanel() {
    const currentVariableId = useSelector(selectCurrentVariableId);
    const currentVariableConnectorId = useSelector(selectCurrentVariableConnectorId);
    const dispatch = useAppDispatch();
    const variables = useSelector(selectVariables);

    const { handleImageChange } = useVariableComponents(currentVariableId);
    const { onVariableBlur } = useUiConfigContext();

    const previewCall = (id: string): Promise<Uint8Array> =>
        window.StudioUISDK.mediaConnector.download(currentVariableConnectorId, id, MediaDownloadType.mediumres, {});

    const handleUpdateImage = useCallback(
        async (source: Media) => {
            dispatch(showVariablesPanel());
            const imgSrc = {
                assetId: source.id,
                connectorId: currentVariableConnectorId,
            };
            await handleImageChange(imgSrc);
            const variable = variables.find((item) => item.id === currentVariableId) as ImageVariable | undefined;
            if (variable)
                dispatch(
                    validateVariable({
                        ...variable,
                        value: { ...variable.value, ...imgSrc },
                    } as ImageVariable),
                );
        },
        [currentVariableConnectorId, handleImageChange, currentVariableId, variables, dispatch],
    );

    const handleAssetSelection = useCallback(
        async (asset: Media) => {
            await handleUpdateImage(asset);
            onVariableBlur?.(currentVariableId);
        },
        [handleUpdateImage, onVariableBlur, currentVariableId],
    );

    if (!currentVariableConnectorId) return null;

    return (
        <ItemBrowser<Media>
            isPanelOpen
            connectorId={currentVariableConnectorId}
            queryCall={window.StudioUISDK.mediaConnector.query}
            previewCall={previewCall}
            onSelect={handleAssetSelection}
            convertToPreviewType={convertToPreviewType}
        />
    );
}

export default ImagePanel;

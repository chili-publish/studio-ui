import { Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { useCallback } from 'react';
import { convertToPreviewType } from '../../utils/mediaUtils';
import ItemBrowser from '../itemBrowser/ItemBrowser';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { useUiConfigContext } from '../../contexts/UiConfigContext';

function ImagePanel() {
    const { handleUpdateImage, currentVariableConnectorId, currentVariableId } = useVariablePanelContext();
    const { onVariableBlur } = useUiConfigContext();

    const previewCall = (id: string): Promise<Uint8Array> =>
        window.StudioUISDK.mediaConnector.download(currentVariableConnectorId, id, MediaDownloadType.mediumres, {});

    const handleAssetSelection = useCallback(
        async (asset: Media) => {
            await handleUpdateImage(asset);
            onVariableBlur?.(currentVariableId);
        },
        [handleUpdateImage, onVariableBlur],
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

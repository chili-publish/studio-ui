import { Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { convertToPreviewType } from '../../utils/mediaUtils';
import ItemBrowser from '../itemBrowser/ItemBrowser';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';

function ImagePanel({ height }: { height?: string }) {
    const { handleUpdateImage, currentVariableConnectorId } = useVariablePanelContext();
    const previewCall = (id: string): Promise<Uint8Array> =>
        window.SDK.mediaConnector.download(currentVariableConnectorId, id, MediaDownloadType.thumbnail, {});

    if (!currentVariableConnectorId) return null;

    return (
        <ItemBrowser<Media>
            isPanelOpen
            connectorId={currentVariableConnectorId}
            queryCall={window.SDK.mediaConnector.query}
            previewCall={previewCall}
            onSelect={(assets) => {
                if (assets.length > 0) handleUpdateImage(assets[0]);
            }}
            convertToPreviewType={convertToPreviewType}
            height={height}
        />
    );
}

export default ImagePanel;

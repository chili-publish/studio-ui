import { Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { convertToPreviewType } from '../../utils/mediaUtils';
import ItemBrowser from '../itemBrowser/ItemBrowser';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';

function ImagePanel({ height }: { height?: string }) {
    const { defaultMediaConnector } = useVariablePanelContext();
    const previewCall = (id: string): Promise<Uint8Array> =>
        window.SDK.mediaConnector.download(defaultMediaConnector.id, id, MediaDownloadType.LowResolutionWeb, {});

    const { handleUpdateImage } = useVariablePanelContext();

    return (
        <ItemBrowser<Media>
            isPanelOpen
            connectorId={defaultMediaConnector.id}
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

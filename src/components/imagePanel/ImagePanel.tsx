import { Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { convertToPreviewType } from '../../utils/media-utils';
import ItemBrowser from '../itemBrowser/ItemBrowser';
import { useTrayAndLeftPanelContext } from '../../contexts/TrayAndLeftPanelContext';

const DEFAULT_MEDIA_CONNECTOR = 'grafx-media';

function ImagePanel() {
    const previewCall = (id: string): Promise<Uint8Array> =>
        window.SDK.mediaConnector.download(DEFAULT_MEDIA_CONNECTOR, id, MediaDownloadType.LowResolutionWeb, {});

    const { handleUpdateImage } = useTrayAndLeftPanelContext();

    return (
        <ItemBrowser<Media>
            isPanelOpen
            connectorId={DEFAULT_MEDIA_CONNECTOR}
            queryCall={window.SDK.mediaConnector.query}
            previewCall={previewCall}
            onSelect={(assets) => {
                if (assets.length > 0) handleUpdateImage(assets[0]);
            }}
            convertToPreviewType={convertToPreviewType}
            isModal={false}
        />
    );
}

export default ImagePanel;

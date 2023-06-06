import { Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { convertToPreviewType } from '../../utils/media-utils';
import ItemBrowser from '../itemBrowser/ItemBrowser';
import { useTrayAndLeftPanelContext } from '../../contexts/TrayAndLeftPanelContext';

function ImagePanel() {
    const previewCall = (id: string): Promise<Uint8Array> =>
        window.SDK.mediaConnector.download(
            process.env.DEFAULT_MEDIA_CONNECTOR as string,
            id,
            MediaDownloadType.LowResolutionWeb,
            {},
        );

    const { handleUpdateImage } = useTrayAndLeftPanelContext();

    return (
        <ItemBrowser<Media>
            isPanelOpen
            connectorId={process.env.DEFAULT_MEDIA_CONNECTOR as string}
            queryCall={window.SDK.mediaConnector.query}
            previewCall={previewCall}
            onSelect={(assets) => {
                if (assets.length > 0) handleUpdateImage(assets[0]);
            }}
            convertToPreviewType={convertToPreviewType}
        />
    );
}

export default ImagePanel;

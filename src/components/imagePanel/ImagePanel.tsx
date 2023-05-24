import { Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { convertToPreviewType } from '../../utils/media-utils';
import ItemBrowser from '../itemBrowser/ItemBrowser';

const DEFAULT_MEDIA_CONNECTOR = 'grafx-media';
interface ImagePanelProps {
    showVariablesPanel: () => void;
}

function ImagePanel({ showVariablesPanel }: ImagePanelProps) {
    const previewCall = (id: string): Promise<Uint8Array> =>
        window.SDK.mediaConnector.download(DEFAULT_MEDIA_CONNECTOR, id, MediaDownloadType.LowResolutionWeb, {});

    return (
        <ItemBrowser<Media>
            isPanelOpen
            connectorId={DEFAULT_MEDIA_CONNECTOR}
            queryCall={window.SDK.mediaConnector.query}
            previewCall={previewCall}
            onSelect={() => undefined}
            convertToPreviewType={convertToPreviewType}
            isModal={false}
            showVariablesPanel={showVariablesPanel}
        />
    );
}

export default ImagePanel;

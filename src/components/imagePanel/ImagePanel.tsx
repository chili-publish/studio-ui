import { ImageVariableSource, ImageVariableSourceType, Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { convertToPreviewType } from '../../utils/media-utils';
import ItemBrowser from '../itemBrowser/ItemBrowser';
import { useTrayAndLeftPanelContext } from '../../contexts/TrayAndLeftPanelContext';

const DEFAULT_MEDIA_CONNECTOR = 'grafx-media';

function ImagePanel() {
    const previewCall = (id: string): Promise<Uint8Array> =>
        window.SDK.mediaConnector.download(DEFAULT_MEDIA_CONNECTOR, id, MediaDownloadType.LowResolutionWeb, {});

    const { currentVariableId, showVariablesPanel } = useTrayAndLeftPanelContext();

    const handleImageChange = async (source: ImageVariableSource) => {
        if (currentVariableId) {
            const result = await window.SDK.variable.setVariableSource(currentVariableId, source);
            return result;
        }
        return null;
    };

    const handleUpdateImage = async (source: Media) => {
        await handleImageChange({
            assetId: source.id,
            connectorId: process.env.DEFAULT_MEDIA_CONNECTOR as string,
            sourceType: ImageVariableSourceType.mediaConnector,
        });
        showVariablesPanel();
    };

    return (
        <ItemBrowser<Media>
            isPanelOpen
            connectorId={DEFAULT_MEDIA_CONNECTOR}
            queryCall={window.SDK.mediaConnector.query}
            previewCall={previewCall}
            onSelect={(assets) => {
                handleUpdateImage(assets[0]);
            }}
            convertToPreviewType={convertToPreviewType}
            isModal={false}
        />
    );
}

export default ImagePanel;

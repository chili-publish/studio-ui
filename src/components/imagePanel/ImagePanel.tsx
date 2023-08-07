import { Media, MediaDownloadType } from '@chili-publish/studio-sdk';
import { useContext } from 'react';
import { convertToPreviewType } from '../../utils/mediaUtils';
import ItemBrowser from '../itemBrowser/ItemBrowser';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { connectorsContext } from '../../contexts/ConnectorsContext';

function ImagePanel() {
    const { mediaConnectors } = useContext(connectorsContext);
    const previewCall = (id: string): Promise<Uint8Array> =>
        window.SDK.mediaConnector.download(mediaConnectors[0].id as string, id, MediaDownloadType.LowResolutionWeb, {});

    const { handleUpdateImage } = useVariablePanelContext();

    return (
        <ItemBrowser<Media>
            isPanelOpen
            connectorId={mediaConnectors[0].id as string}
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

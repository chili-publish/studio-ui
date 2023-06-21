import React from 'react';
import { PreviewCard } from '@chili-publish/grafx-shared-components';
import { Grid, GridItem } from './ImagePanel.styles';
import { convertAssetTypeToString, convertToPreviewType } from '../../utils/media-utils';
import { AssetType, AssetWithPreview } from '../../utils/ApiTypes';

interface ImageGridProps {
    assets: AssetWithPreview[];
    handleAssetClick: (asset: AssetWithPreview) => void;
}

export function ImageGrid(props: ImageGridProps) {
    const { assets, handleAssetClick } = props;
    const mockPreviews = assets.map((asset, idx) => (
        <GridItem key={asset.id} itemId={idx}>
            <PreviewCard
                type={convertToPreviewType(AssetType.FOLDER)}
                itemId={asset.id}
                name={asset.name}
                metaData={convertAssetTypeToString(asset)}
                path={asset.type === AssetType.ASSET ? asset.preview : undefined}
                padding="0"
                menuWidth="11rem"
                onClickCard={() => handleAssetClick(asset)}
                footerTopMargin="1rem"
            />
        </GridItem>
    ));
    return <Grid>{mockPreviews}</Grid>;
}

export default ImageGrid;

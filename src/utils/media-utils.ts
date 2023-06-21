import { BreakPoints, PreviewType } from '@chili-publish/grafx-shared-components';
import { Asset, AssetType, AssetTypeToString } from './ApiTypes';

export const mobileMediaQuery = `@media (max-width: ${BreakPoints.mobileSize})`;

export const convertToPreviewType = (assetType: AssetType): PreviewType => {
    if (assetType === AssetType.FOLDER) {
        return PreviewType.COLLECTION;
    }
    return PreviewType.IMAGE;
};

export const convertAssetTypeToString = (asset: Asset): AssetTypeToString | string => {
    if (asset.type === AssetType.FOLDER) {
        return AssetTypeToString.FOLDER;
    }
    return asset?.extension?.toUpperCase() || '';
};

export const toNavigationStack = (path: string): string[] => {
    const regex = /\\/g;
    return path.replace(regex, '/').replace(/^\/+/, '').split('/');
};

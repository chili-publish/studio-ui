export type Asset = {
    id: string;
    name: string;
    relativePath: string;
    type: AssetType;
    extension: string | null;
};
export type AssetWithPreview = Asset & { preview: string };

export enum AssetType {
    ASSET = 0,
    FOLDER = 1,
}

export enum AssetTypeToString {
    FOLDER = 'Folder',
}

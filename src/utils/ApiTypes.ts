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

// It partially describe the API Connector Entity
// https://main.cpstaging.online/grafx/swagger/index.html?urls.primaryName=experimental#/Connectors/get_api_experimental_environment__environment__connectors__connectorId_
export type MediaRemoteConnector = {
    id: string;
    name: string;
    description: string;
    iconUrl: string | null;
    scriptSource: 'external' | 'defaultMedia';
    type: 'media';
    default: boolean;
    enabled: boolean;
    supportedAuthentication: {
        browser: Array<'oAuth2AuthorizationCode' | 'none'>;
    };
    ownerType: string;
};

import { DownloadFormats } from '@chili-publish/studio-sdk';
import { AxiosError, AxiosResponse } from 'axios';
import { ITheme } from '@chili-publish/grafx-shared-components';
import { ConnectorAuthenticationResult } from './ConnectorAuthenticationResult';

export interface ProjectConfig {
    projectId: string;
    projectName: string;
    uiOptions: UiOptions;
    uiTheme: ITheme['mode'] | 'system';
    outputSettings: OutputSettings;
    userInterfaceID?: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    onProjectInfoRequested: (projectId: string) => Promise<Project>;
    onProjectDocumentRequested: (projectId: string) => Promise<string>;
    onProjectLoaded: (project: Project) => void;
    onProjectSave: (generateJson: () => Promise<string>) => Promise<Project>;
    onAuthenticationRequested: () => string;
    onAuthenticationExpired: () => Promise<string>;
    onUserInterfaceBack: () => void;
    onLogInfoRequested: () => unknown;
    onProjectGetDownloadLink: (
        extension: string,
        selectedLayoutID: string | undefined,
        outputSettingsId: string | undefined,
    ) => Promise<DownloadLinkResult>;
    overrideEngineUrl?: string;
    onFetchOutputSettings?: (_?: string) => Promise<UserInterfaceOutputSettings[] | null>;
    onFetchUserInterfaces?: () => Promise<AxiosResponse<PaginatedResponse<UserInterface>, any>>;
    onConnectorAuthenticationRequested?: (connectorId: string) => Promise<ConnectorAuthenticationResult>;
}

export interface DefaultStudioConfig {
    selector: string;
    projectDownloadUrl: string;
    projectUploadUrl: string;
    projectId: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    authToken: string;
    uiOptions?: UiOptions;
    uiTheme?: ITheme['mode'] | 'system';
    outputSettings?: OutputSettings;
    projectName: string;
    refreshTokenAction?: () => Promise<string | AxiosError>;
    editorLink?: string;
    userInterfaceID?: string;
    onConnectorAuthenticationRequested?: (connectorId: string) => Promise<ConnectorAuthenticationResult>;
}

export interface StudioConfig extends DefaultStudioConfig {
    onProjectInfoRequested: () => Promise<Project>;
    onProjectDocumentRequested: () => Promise<string>;
    onProjectSave: (generateJson: () => Promise<string>) => Promise<Project>;
}

export type DownloadLinkResult = {
    status: number;
    error: string | undefined;
    success: boolean;
    parsedData: string | undefined;
    data: string | undefined;
};

export interface UiOptions {
    widgets: {
        downloadButton?: {
            visible?: boolean;
        };
        backButton?: {
            visible?: boolean;
            event?: () => void;
        };
    };
}

export type OutputSettings = { [K in DownloadFormats]?: boolean };

export type UserInterfaceOutputSettings = {
    name: string;
    id: string;
    description: string;
    type: DownloadFormats;
    layoutIntents: string[];
};

export type UserInterface = {
    name: string;
    id: string;
    default: boolean;
    outputSettings: {
        [index: string]: {
            layoutIntents: string[];
        };
    };
};

export type PaginatedResponse<T> = {
    data: T[];
    pageSize: number;
    links?: {
        nextPage: string;
    };
};

export interface IOutputSetting {
    WatermarkText: string;
    default: boolean;
    description: string;
    id: string;
    name: string;
    type: string;
    watermark: boolean;
}

export const defaultUiOptions: UiOptions = {
    widgets: {
        downloadButton: {
            visible: true,
        },
        backButton: {
            visible: false,
        },
    },
};

export const defaultPlatformUiOptions: UiOptions = {
    ...defaultUiOptions,
    widgets: { ...defaultUiOptions.widgets, backButton: { visible: true } },
};

export const defaultOutputSettings: OutputSettings = {
    mp4: true,
    gif: true,
    png: true,
    jpg: true,
    pdf: true,
};

// eslint-disable-next-line no-restricted-globals
export const defaultBackFn = () => history.back();

export type HttpHeaders = { headers: { 'Content-Type': string; Authorization?: string } };

export type Project = { name: string; id: string; template: { id: string } };

export interface IStudioUILoaderConfig {
    selector: string;
    projectId: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    authToken: string;
    projectName: string;
    refreshTokenAction?: () => Promise<string | AxiosError>;
    uiOptions?: UiOptions;
    uiTheme?: ITheme['mode'] | 'system';
    userInterfaceID?: string;
    outputSettings?: OutputSettings;
    editorLink?: string;
    projectDownloadUrl?: string;
    projectUploadUrl?: string;
    onProjectInfoRequested?: (projectId: string) => Promise<Project>;
    onProjectDocumentRequested?: (projectId: string) => Promise<string>;
    onProjectSave?: (generateJson: () => Promise<string>) => Promise<Project>;
    onProjectLoaded?: (project: Project) => void;
    onAuthenticationRequested?: () => string;
    onAuthenticationExpired?: () => Promise<string>;
    onLogInfoRequested?: () => void;
    onProjectGetDownloadLink?: (
        extension: string,
        selectedLayoutID: string | undefined,
        outputSettingsId: string | undefined,
    ) => Promise<DownloadLinkResult>;
    onConnectorAuthenticationRequested?: (connectorId: string) => Promise<ConnectorAuthenticationResult>;
}

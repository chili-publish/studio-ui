import { ITheme, UiThemeConfig } from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import { AxiosError, AxiosResponse } from 'axios';
import { ConnectorAuthenticationResult } from './ConnectorAuthenticationResult';

export type FeatureFlagsType = Record<string, boolean>;

export enum LoadDocumentError {
    PARSING_ERROR = 'PARSING_ERROR',
    FORMAT_ERROR = 'FORMAT_ERROR',
    VERSION_ERROR = 'VERSION_ERROR',
    TECHNICAL_ERROR = 'TECHNICAL_ERROR',
}

export type ProjectConfig = {
    projectId?: string;
    projectName: string;
    uiOptions: UiOptions;
    uiTheme: ITheme['mode'] | 'system';
    outputSettings: OutputSettings;
    userInterfaceID?: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    sandboxMode: boolean;
    featureFlags?: FeatureFlagsType;
    onSandboxModeToggle?: () => void;
    onProjectInfoRequested: (projectId?: string) => Promise<Project>;
    onProjectDocumentRequested: (projectId?: string) => Promise<string | null>;
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
    onFetchOutputSettings?: (_?: string) => Promise<UserInterfaceWithOutputSettings | null>;
    onFetchUserInterfaces?: () => Promise<AxiosResponse<PaginatedResponse<UserInterface>, any>>;
    onConnectorAuthenticationRequested?: (connectorId: string) => Promise<ConnectorAuthenticationResult>;
    customElement?: HTMLElement | string;
    onSetMultiLayout?: (setMultiLayout: React.Dispatch<React.SetStateAction<boolean>>) => void;
    onVariableFocus?: (variableId: string) => void;
    onVariableBlur?: (variableId: string) => void;
};

export interface DefaultStudioConfig {
    selector: string;
    projectDownloadUrl: string;
    projectUploadUrl: string;
    projectId: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    authToken: string;
    featureFlags?: FeatureFlagsType;
    uiOptions?: UiOptions;
    uiTheme?: ITheme['mode'] | 'system';
    outputSettings?: OutputSettings;
    projectName: string;
    sandboxMode?: boolean;
    onSandboxModeToggle?: () => void;
    refreshTokenAction?: () => Promise<string | AxiosError>;
    editorLink?: string;
    userInterfaceID?: string;
    onConnectorAuthenticationRequested?: (connectorId: string) => Promise<ConnectorAuthenticationResult>;
    customElement?: HTMLElement | string;
    onSetMultiLayout?: (setMultiLayout: React.Dispatch<React.SetStateAction<boolean>>) => void;
    onVariableFocus?: (variableId: string) => void;
    onVariableBlur?: (variableId: string) => void;
}

export interface StudioConfig extends Omit<DefaultStudioConfig, 'projectId' | 'projectDownloadUrl'> {
    projectId?: string;
    projectDownloadUrl?: string;
    onProjectInfoRequested: () => Promise<Project>;
    onProjectDocumentRequested: () => Promise<string | null>;
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
    theme?: UiThemeConfig;
    widgets?: {
        downloadButton?: {
            visible?: boolean;
        };
        backButton?: {
            visible?: boolean;
            event?: () => void;
        };
        navBar?: {
            visible?: boolean;
        };
        bottomBar?: {
            visible?: boolean;
        };
    };
    /**
     * Experimental. Don't use in production. Will be changed soon.
     */
    layoutSection?: {
        layoutSwitcherVisible?: boolean;
        title?: string;
    };
}

export type OutputSettings = { [K in DownloadFormats]?: boolean };

export type UserInterfaceOutputSettings = {
    name: string;
    id: string;
    description: string;
    type: DownloadFormats;
    dataSourceEnabled: boolean;
    layoutIntents: string[];
};

export type UserInterfaceWithOutputSettings = {
    outputSettings: UserInterfaceOutputSettings[];
    userInterface: {
        id: string;
        name: string;
    };
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
    watermarkText: string;
    default: boolean;
    description: string;
    id: string;
    name: string;
    type: string;
    watermark: boolean;
}

export const defaultUiOptions = {
    widgets: {
        downloadButton: {
            visible: true,
        },
        backButton: {
            visible: false,
        },
    },
    layoutSection: {
        layoutSwitcherVisible: true,
        title: 'Layout',
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
    projectId?: string;
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
    sandboxMode?: boolean;
    featureFlags?: Record<string, boolean>;
    onSandboxModeToggle?: () => void;
    onProjectInfoRequested?: (projectId?: string) => Promise<Project>;
    onProjectDocumentRequested?: (projectId?: string) => Promise<string | null>;
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
    customElement?: HTMLElement | string;
    onSetMultiLayout?: (setMultiLayout: React.Dispatch<React.SetStateAction<boolean>>) => void;
    onVariableFocus?: (variableId: string) => void;
    onVariableBlur?: (variableId: string) => void;
}

export type PageSnapshot = {
    id: string;
    snapshot: Uint8Array;
};

import { DownloadFormats } from '@chili-publish/studio-sdk';
import { AxiosError } from 'axios';

export interface ProjectConfig {
    projectId: string;
    projectName: string;
    uiOptions: UiOptions;
    outputSettings: OutputSettings;
    onProjectInfoRequested: (projectId: string) => Promise<Project>;
    onProjectDocumentRequested: (projectId: string) => Promise<string>;
    onProjectLoaded: (project: Project) => void;
    onProjectSave: (generateJson: () => Promise<string>) => Promise<Project>;
    onAuthenticationRequested: () => string;
    onAuthenticationExpired: () => Promise<string>;
    onUserInterfaceBack: () => void;
    onLogInfoRequested: () => unknown;
    onProjectGetDownloadLink: (extension: string, selectedLayoutID: string | undefined) => Promise<DownloadLinkResult>;
    overrideEngineUrl?: string | undefined;
}

export interface DefaultStudioConfig {
    selector: string;
    projectDownloadUrl: string;
    projectUploadUrl: string;
    projectId: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    authToken: string;
    uiOptions?: UiOptions;
    outputSettings?: OutputSettings;
    projectName: string;
    refreshTokenAction: () => Promise<string | AxiosError>;
    editorLink?: string;
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
    refreshTokenAction: () => Promise<string | AxiosError>;
    uiOptions?: UiOptions;
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
    onProjectGetDownloadLink?: (extension: string, selectedLayoutID: string | undefined) => Promise<DownloadLinkResult>;
}

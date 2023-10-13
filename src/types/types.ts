import { AxiosError } from 'axios';

export interface ProjectConfig {
    projectId: string;
    projectName: string;
    onProjectInfoRequested: (projectId: string) => Promise<Project>;
    onProjectTemplateRequested: (projectId: string) => Promise<string>;
    onProjectLoaded: (project: Project) => void;
    onProjectSave: (generateJson: () => Promise<string>) => Promise<Project>;
    onAuthenticationRequested: () => string;
    onAuthenticationExpired: () => Promise<string>;
    onUserInterfaceBack: () => void;
    onLogInfoRequested: () => unknown;
    onProjectGetDownloadLink: (extension: string, selectedLayoutID: string | undefined) => Promise<DownloadLinkResult>;
    overrideEngineUrl?: string | undefined;
}

export type DownloadLinkResult = {
    status: number;
    error: string | undefined;
    success: boolean;
    parsedData: string | undefined;
    data: string | undefined;
};

export type HttpHeaders = { headers: { 'Content-Type': string; Authorization?: string } };

export type Project = { name: string; id: string; template: { id: string } };

export interface IStudioUILoaderConfig {
    selector: string;
    projectDownloadUrl: string;
    projectUploadUrl: string;
    projectId: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    authToken: string;
    projectName: string;
    editorLink?: string;
    refreshTokenAction: () => Promise<string | AxiosError>;
    onBack: () => void;

    onProjectInfoRequested?: (projectId: string) => Promise<Project>;
    onProjectTemplateRequested?: (projectId: string) => Promise<string>;
    onProjectSave?: (generateJson: () => Promise<string>) => Promise<Project>;
    onProjectLoaded?: (project: Project) => void;
    onAuthenticationRequested?: () => string;
    onAuthenticationExpired?: () => Promise<string>;
    onUserInterfaceBack?: () => void;
    onLogInfoRequested?: () => void;
    onProjectGetDownloadLink?: (extension: string, selectedLayoutID: string | undefined) => Promise<DownloadLinkResult>;
}

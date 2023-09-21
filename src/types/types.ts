import type SDK from '@chili-publish/studio-sdk';

export interface ProjectConfig {
    projectId: string;
    projectName: string;
    onProjectInfoRequested: (projectId: string) => Promise<Project>;
    onProjectTemplateRequested: (projectId: string) => Promise<string>;
    onProjectLoaded: (project: Project, sdk: SDK) => void;
    onProjectSave: (sdk: SDK) => Promise<Project>;
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

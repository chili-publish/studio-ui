import React from 'react';
import ReactDOM from 'react-dom/client';
import { AxiosError } from 'axios';
import App from './App';
import './index.css';

declare global {
    interface Window {
        EndUserWorkspace: unknown;
    }
}

interface ProjectConfig {
    templateDownloadUrl: string;
    templateUploadUrl: string;
    templateId: string;
    graFxStudioEnvironmentApiBaseUrl: string;
    authToken?: string;
    refreshTokenAction: () => Promise<string | AxiosError>;
    projectName: string;
    onBack: () => void;
}
export default class EndUserWorkspace {
    constructor(selector: string, editorLink: string, projectConfig?: ProjectConfig) {
        ReactDOM.createRoot(document.getElementById(selector || 'end-user-workspace-root') as HTMLElement).render(
            <React.StrictMode>
                <App editorLink={editorLink} projectConfig={projectConfig} />
            </React.StrictMode>,
        );
    }

    static defaultConfigWithEditorLink(selector: string, editorLink: string) {
        return new this(selector, editorLink, undefined);
    }

    static studioLoaderConfig(
        selector: string,
        templateDownloadUrl: string,
        templateUploadUrl: string,
        templateId: string,
        graFxStudioEnvironmentApiBaseUrl: string,
        authToken: string,
        refreshTokenAction: () => Promise<string | AxiosError>,
        projectName: string,
        onBack: () => void,
    ) {
        const editorLink = '';
        return new this(selector, editorLink, {
            templateDownloadUrl,
            templateUploadUrl,
            templateId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            refreshTokenAction: () => refreshTokenAction(),
            projectName,
            onBack: () => onBack(),
        });
    }
}

// Make this class accessible on window
window.EndUserWorkspace = EndUserWorkspace;

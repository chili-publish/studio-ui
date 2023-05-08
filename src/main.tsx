import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ProjectConfig } from './types/types';
import './index.css';

declare global {
    interface Window {
        EndUserWorkspace: unknown;
    }
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
        refreshTokenAction: () => Promise<string>,
    ) {
        const editorLink = '';
        return new this(selector, editorLink, {
            templateDownloadUrl,
            templateUploadUrl,
            templateId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            refreshTokenAction: () => refreshTokenAction(),
        });
    }
}

// Make this class accessible on window
window.EndUserWorkspace = EndUserWorkspace;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { AxiosError } from 'axios';
import App from './App';
import { ProjectConfig } from './types/types';
import './index.css';

declare global {
    interface Window {
        StudioUI: unknown;
    }
}

export default class StudioUI {
    constructor(selector: string, editorLink: string, projectConfig?: ProjectConfig) {
        ReactDOM.createRoot(document.getElementById(selector || 'studio-ui-root') as HTMLElement).render(
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
        projectDownloadUrl: string,
        projectUploadUrl: string,
        projectId: string,
        graFxStudioEnvironmentApiBaseUrl: string,
        authToken: string,
        refreshTokenAction: () => Promise<string | AxiosError>,
        projectName: string,
        onBack: () => void,
    ) {
        const editorLink = '';
        return new this(selector, editorLink, {
            projectDownloadUrl,
            projectUploadUrl,
            projectId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            refreshTokenAction: () => refreshTokenAction(),
            projectName,
            onBack: () => onBack(),
        });
    }
}

// Make this class accessible on window
window.StudioUI = StudioUI;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { AxiosError } from 'axios';
import type SDK from '@chili-publish/studio-sdk';
import App from './App';
import { DownloadLinkResult, Project, ProjectConfig } from './types/types';
import { DemoDocumentLoader } from './DemoDocumentLoader';
import { StudioProjectLoader } from './StudioProjectLoader';
import './index.css';

declare global {
    interface Window {
        StudioUI: unknown;
    }
}

export default class StudioUI {
    constructor(selector: string, projectConfig: ProjectConfig) {
        ReactDOM.createRoot(document.getElementById(selector || 'sui-root') as HTMLElement).render(
            <React.StrictMode>
                <App projectConfig={projectConfig} />
            </React.StrictMode>,
        );
    }

    /**
     * Creates a new instance of StudioUI with with the demo document loaded.
     * @param selector - The selector for the root element of the UI.
     * @param editorLink - Url to the engine /web folder
     * @returns A new instance of StudioUI.
     */
    static defaultConfigWithEditorLink(selector: string, editorLink: string) {
        const demoDocumentLoader = new DemoDocumentLoader(editorLink);

        return new StudioUI(selector, {
            projectId: 'demo',
            projectName: 'Demo',
            onProjectInfoRequested: demoDocumentLoader.onProjectInfoRequested,
            onProjectTemplateRequested: demoDocumentLoader.onProjectTemplateRequested,
            onProjectLoaded: demoDocumentLoader.onProjectLoaded,
            onProjectSave: demoDocumentLoader.onProjectSave,
            onAuthenticationRequested: demoDocumentLoader.onAuthenticationRequested,
            onAuthenticationExpired: demoDocumentLoader.onAuthenticationExpired,
            onUserInterfaceBack: () => {
                // ignored
            },
            onLogInfoRequested: demoDocumentLoader.onLogInfoRequested,
            onProjectGetDownloadLink: demoDocumentLoader.onProjectGetDownloadLink,
            overrideEngineUrl: editorLink,
        });
    }

    /**
     * Creates a new instance of StudioUI with all integration points available. Use this if you want
     * to use your own project loader and authentication.
     * @param selector - The selector for the root element of the UI.
     * @param projectId - The id of the project to load.
     * @param projectName - The name of the project to load.
     * @param onProjectInfoRequested - Callback to get the project info.
     * @param onProjectTemplateRequested - Callback to get the project template.
     * @param onProjectSave - Callback to save the project.
     * @param onProjectLoaded - Callback when the project is loaded. use this to set the configuration values on sdk.
     * @param onAuthenticationRequested - Callback to get the authentication token.
     * @param onAuthenticationExpired - Callback to refresh the authentication token.
     * @param onUserInterfaceBack - Callback when the user clicks the back button.
     * @param onLogInfoRequested - Callback used to generate loading info in the console.
     * @param onProjectGetDownloadLink - Callback to get the output download link for the project.
     * @returns
     */
    static fullIntegrationConfig(
        selector: string,
        projectId: string,
        projectName: string,
        onProjectInfoRequested: (projectId: string) => Promise<Project>,
        onProjectTemplateRequested: (projectId: string) => Promise<string>,
        onProjectSave: (sdk: SDK) => Promise<Project>,
        onProjectLoaded: (project: Project, sdk: SDK) => void,
        onAuthenticationRequested: () => string,
        onAuthenticationExpired: () => Promise<string>,
        onUserInterfaceBack: () => void,
        onLogInfoRequested: () => void,
        onProjectGetDownloadLink: (
            extension: string,
            selectedLayoutID: string | undefined,
        ) => Promise<DownloadLinkResult>,
    ) {
        return new StudioUI(selector, {
            projectId,
            projectName,
            onProjectInfoRequested,
            onProjectTemplateRequested,
            onProjectLoaded,
            onProjectSave,
            onAuthenticationRequested,
            onAuthenticationExpired,
            onUserInterfaceBack,
            onLogInfoRequested,
            onProjectGetDownloadLink,
        });
    }

    /**
     * Creates a new instance of StudioUI with the default project loader and authentication.
     * @param selector - The selector for the root element of the UI.
     * @param projectDownloadUrl - Environment API url to download the project.
     * @param projectUploadUrl - Environment API url to upload the project.
     * @param projectId - The id of the project to load.
     * @param graFxStudioEnvironmentApiBaseUrl - Environment API url to get the project info.
     * @param authToken - Environment API authentication token.
     * @param refreshTokenAction - Callback to refresh the authentication token.
     * @param projectName - The name of the project to load.
     * @param onBack - Callback when the user clicks the back button.
     * @returns
     */
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
        const projectLoader = new StudioProjectLoader(
            projectId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            refreshTokenAction,
            projectDownloadUrl,
            projectUploadUrl,
        );

        return StudioUI.fullIntegrationConfig(
            selector,
            projectId,
            projectName,
            projectLoader.onProjectInfoRequested,
            projectLoader.onProjectTemplateRequested,
            projectLoader.onProjectSave,
            projectLoader.onProjectLoaded,
            projectLoader.onAuthenticationRequested,
            projectLoader.onAuthenticationExpired,
            onBack,
            projectLoader.onLogInfoRequested,
            projectLoader.onProjectGetDownloadLink,
        );
    }

    /**
     * Creates a new instance of StudioUI with the default  authentication, and allows to set
     * the project loader callbacks. Bring your own project json.
     * In this scenario, the environment api is used for the template connectors and
     * to generate output download links.
     * @param selector - The selector for the root element of the UI.
     * @param projectId - The id of the project to load.
     * @param projectName - The name of the project to load.
     * @param graFxStudioEnvironmentApiBaseUrl - Environment API url to get the project info.
     * @param authToken - Environment API authentication token.
     * @param refreshTokenAction - Callback to refresh the authentication token.
     * @param onBack - Callback when the user clicks the back button.
     * @param onProjectInfoRequested - Callback to get the project info.
     * @param onProjectTemplateRequested - Callback to get the project template.
     * @param onProjectSave - Callback to save the project.
     * @returns
     */
    static studioLoaderCustomTemplateConfig(
        selector: string,
        projectId: string,
        projectName: string,
        graFxStudioEnvironmentApiBaseUrl: string,
        authToken: string,
        refreshTokenAction: () => Promise<string | AxiosError>,
        onBack: () => void,
        onProjectInfoRequested: (projectId: string) => Promise<Project>,
        onProjectTemplateRequested: (projectId: string) => Promise<string>,
        onProjectSave: (sdk: SDK) => Promise<Project>,
    ) {
        const projectLoader = new StudioProjectLoader(
            projectId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            refreshTokenAction,
        );

        return StudioUI.fullIntegrationConfig(
            selector,
            projectId,
            projectName,
            onProjectInfoRequested,
            onProjectTemplateRequested,
            onProjectSave,
            projectLoader.onProjectLoaded,
            projectLoader.onAuthenticationRequested,
            projectLoader.onAuthenticationExpired,
            onBack,
            projectLoader.onLogInfoRequested,
            projectLoader.onProjectGetDownloadLink,
        );
    }
}

// Make this class accessible on window
window.StudioUI = StudioUI;

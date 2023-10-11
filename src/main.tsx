import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {
    DownloadLinkResult,
    OutputSettings,
    Project,
    ProjectConfig,
    StudioConfig,
    UiOptions,
    defaultBackFn,
    defaultOutputSettings,
    defaultPlatformUiOptions,
    defaultUiOptions,
} from './types/types';
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
            uiOptions: defaultUiOptions,
            outputSettings: defaultOutputSettings,
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
     * @param config.uiOptions - The configuration of ui widgets.
     * @param config.outputSettings - The flags to manage the available types of outputs.
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
        uiOptions: UiOptions,
        outputSettings: OutputSettings,
        onProjectInfoRequested: (projectId: string) => Promise<Project>,
        onProjectTemplateRequested: (projectId: string) => Promise<string>,
        onProjectSave: (generateJson: () => Promise<string>) => Promise<Project>,
        onProjectLoaded: (project: Project) => void,
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
            uiOptions,
            outputSettings,
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
     * @param config - The configuration data.
     * @param config.selector - The selector for the root element of the UI.
     * @param config.projectDownloadUrl - Environment API url to download the project.
     * @param config.projectUploadUrl - Environment API url to upload the project.
     * @param config.projectId - The id of the project to load.
     * @param config.graFxStudioEnvironmentApiBaseUrl - Environment API url to get the project info.
     * @param config.authToken - Environment API authentication token.
     * @param config.uiOptions - The configuration of ui widgets.
     * @param config.outputSettings - The flags to manage the available types of outputs.
     * @param config.refreshTokenAction - Callback to refresh the authentication token.
     * @param config.projectName - The name of the project to load.
     * @param config.onBack - Callback when the user clicks the back button.
     * @returns
     */
    static studioLoaderConfig(config: StudioConfig) {
        const {
            selector,
            projectDownloadUrl,
            projectUploadUrl,
            projectId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            uiOptions,
            outputSettings,
            projectName,
            refreshTokenAction,
        } = config;
        const projectLoader = new StudioProjectLoader(
            projectId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            refreshTokenAction,
            projectDownloadUrl,
            projectUploadUrl,
        );

        const onBack = uiOptions?.widgets?.backButton?.event ?? defaultBackFn;

        return StudioUI.fullIntegrationConfig(
            selector,
            projectId,
            projectName,
            uiOptions || defaultPlatformUiOptions,
            outputSettings || defaultOutputSettings,
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
     * Creates a new instance of StudioUI with the default authentication, and allows to set
     * the project loader callbacks. Bring your own project json.
     * In this scenario, the environment api is used for the template connectors and
     * to generate output download links.
     * @param config - The configuration data.
     * @param config.selector - The selector for the root element of the UI.
     * @param config.projectId - The id of the project to load.
     * @param config.projectName - The name of the project to load.
     * @param config.graFxStudioEnvironmentApiBaseUrl - Environment API url to get the project info.
     * @param config.authToken - Environment API authentication token.
     * @param config.uiOptions - The configuration of ui widgets.
     * @param config.outputSettings - The flags to manage the available types of outputs.
     * @param config.refreshTokenAction - Callback to refresh the authentication token.
     * @param config.onProjectInfoRequested - Callback to get the project info.
     * @param config.onProjectTemplateRequested - Callback to get the project template.
     * @param config.onProjectSave - Callback to save the project.
     * @returns
     */
    static studioLoaderCustomTemplateConfig(config: StudioConfig) {
        const {
            selector,
            projectId,
            projectName,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            refreshTokenAction,
            onProjectInfoRequested,
            onProjectTemplateRequested,
            onProjectSave,
            uiOptions,
            outputSettings,
        } = config;

        const onBack = uiOptions?.widgets?.backButton?.event ?? defaultBackFn;
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
            uiOptions || defaultUiOptions,
            outputSettings || defaultOutputSettings,
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

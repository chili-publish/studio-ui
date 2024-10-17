import React from 'react';
import ReactDOM from 'react-dom/client';
import { AxiosResponse } from 'axios';
import { ITheme } from '@chili-publish/grafx-shared-components';
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
    IStudioUILoaderConfig,
    UserInterface,
    PaginatedResponse,
    UserInterfaceWithOutputSettings,
} from './types/types';
import { DemoDocumentLoader } from './DemoDocumentLoader';
import { StudioProjectLoader } from './StudioProjectLoader';
import './index.css';
import { ConnectorAuthenticationResult } from './types/ConnectorAuthenticationResult';

declare global {
    interface Window {
        StudioUI: typeof StudioUI;
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
            uiTheme: 'light',
            outputSettings: defaultOutputSettings,
            graFxStudioEnvironmentApiBaseUrl: '',
            sandboxMode: false,
            onSandboxModeToggle: () => null,
            onProjectInfoRequested: demoDocumentLoader.onProjectInfoRequested,
            onProjectDocumentRequested: demoDocumentLoader.onProjectDocumentRequested,
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
     * @param onProjectDocumentRequested - Callback to get the project template.
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
        userInterfaceID: string | undefined,
        uiOptions: UiOptions,
        uiTheme: ITheme['mode'] | 'system',
        outputSettings: OutputSettings,
        sandboxMode: boolean,
        onSandboxModeToggle: (() => void) | undefined,
        onProjectInfoRequested: (projectId: string) => Promise<Project>,
        onProjectDocumentRequested: (projectId: string) => Promise<string>,
        onProjectSave: (generateJson: () => Promise<string>) => Promise<Project>,
        onProjectLoaded: (project: Project) => void,
        onAuthenticationRequested: () => string,
        onAuthenticationExpired: () => Promise<string>,
        onUserInterfaceBack: () => void,
        onLogInfoRequested: () => void,
        onProjectGetDownloadLink: (
            extension: string,
            selectedLayoutID: string | undefined,
            outputSettingsId: string | undefined,
        ) => Promise<DownloadLinkResult>,
        editorLink?: string,
        onFetchOutputSettings?: () => Promise<UserInterfaceWithOutputSettings | null>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onFetchUserInterfaces?: () => Promise<AxiosResponse<PaginatedResponse<UserInterface>, any>>,
        onConnectorAuthenticationRequested?: (connectorId: string) => Promise<ConnectorAuthenticationResult>,
        graFxStudioEnvironmentApiBaseUrl = '',
    ) {
        return new StudioUI(selector, {
            projectId,
            projectName,
            userInterfaceID,
            uiOptions,
            uiTheme,
            outputSettings,
            graFxStudioEnvironmentApiBaseUrl,
            sandboxMode,
            onSandboxModeToggle,
            onProjectInfoRequested,
            onProjectDocumentRequested,
            onProjectLoaded,
            onProjectSave,
            onAuthenticationRequested,
            onAuthenticationExpired,
            onUserInterfaceBack,
            onLogInfoRequested,
            onProjectGetDownloadLink,
            overrideEngineUrl: editorLink,
            onFetchOutputSettings,
            onFetchUserInterfaces,
            onConnectorAuthenticationRequested,
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
     * @param config.userInterfaceID - The id of the user interface used to fetch output settings, when passed outputSettings is ignored.
     * @param config.onConnectorAuthenticationRequested - Callback to authenticate in custom connectors
     * @returns
     */
    static studioLoaderConfig(
        config: Omit<StudioConfig, 'onProjectInfoRequested' | 'onProjectDocumentRequested' | 'onProjectSave'>,
    ) {
        const {
            selector,
            projectDownloadUrl,
            projectUploadUrl,
            projectId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            projectName,
            editorLink,
            uiOptions,
            uiTheme,
            outputSettings,
            userInterfaceID,
            sandboxMode,
            onSandboxModeToggle,
            refreshTokenAction,
            onConnectorAuthenticationRequested,
        } = config;
        const projectLoader = new StudioProjectLoader(
            projectId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            refreshTokenAction,
            projectDownloadUrl,
            projectUploadUrl,
            userInterfaceID,
        );

        const onBack = uiOptions?.widgets?.backButton?.event ?? defaultBackFn;

        return StudioUI.fullIntegrationConfig(
            selector,
            projectId,
            projectName,
            userInterfaceID,
            uiOptions ?? defaultPlatformUiOptions,
            uiTheme ?? 'light',
            outputSettings ?? defaultOutputSettings,
            sandboxMode || false,
            onSandboxModeToggle,
            projectLoader.onProjectInfoRequested,
            projectLoader.onProjectDocumentRequested,
            projectLoader.onProjectSave,
            projectLoader.onProjectLoaded,
            projectLoader.onAuthenticationRequested,
            projectLoader.onAuthenticationExpired,
            onBack,
            projectLoader.onLogInfoRequested,
            projectLoader.onProjectGetDownloadLink,
            editorLink,
            projectLoader.onFetchOutputSettings,
            projectLoader.onFetchUserInterfaces,
            onConnectorAuthenticationRequested,
            graFxStudioEnvironmentApiBaseUrl,
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
     * @param config.onProjectDocumentRequested - Callback to get the project template.
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
            sandboxMode,
            onSandboxModeToggle,
            refreshTokenAction,
            onProjectInfoRequested,
            onProjectDocumentRequested,
            onProjectSave,
            uiOptions,
            uiTheme,
            outputSettings,
            onConnectorAuthenticationRequested,
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
            undefined,
            uiOptions || defaultUiOptions,
            uiTheme || 'light',
            outputSettings || defaultOutputSettings,
            sandboxMode || false,
            onSandboxModeToggle,
            onProjectInfoRequested,
            onProjectDocumentRequested,
            onProjectSave,
            projectLoader.onProjectLoaded,
            projectLoader.onAuthenticationRequested,
            projectLoader.onAuthenticationExpired,
            onBack,
            projectLoader.onLogInfoRequested,
            projectLoader.onProjectGetDownloadLink,
            undefined,
            undefined,
            projectLoader.onFetchUserInterfaces,
            onConnectorAuthenticationRequested,
            graFxStudioEnvironmentApiBaseUrl,
        );
    }

    /**
     * Creates a new instance of StudioUI with the default project loader and authentication based on the fullIntegration.
     * if an optional callback is provided f.e onProjectInfoRequested it will be used instead of the default one
     * @param selector - The selector for the root element of the UI.
     * @param projectDownloadUrl - Environment API url to download the project.
     * @param projectUploadUrl - Environment API url to upload the project.
     * @param projectId - The id of the project to load.
     * @param graFxStudioEnvironmentApiBaseUrl - Environment API url to get the project info.
     * @param authToken - Environment API authentication token.
     * @param refreshTokenAction - Callback to refresh the authentication token.
     * @param projectName - The name of the project to load.
     * @param onBack - Callback when the user clicks the back button.
     * @param config.userInterfaceID - The id of the user interface used to fetch output settings, when passed outputSettings is ignored.
     * @returns
     */

    static studioUILoaderConfig(config: IStudioUILoaderConfig) {
        const {
            selector,
            projectDownloadUrl,
            projectUploadUrl,
            projectId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            projectName,
            editorLink,
            uiOptions,
            uiTheme,
            outputSettings,
            userInterfaceID,
            sandboxMode,
            onSandboxModeToggle,
            refreshTokenAction,
            onProjectInfoRequested,
            onProjectDocumentRequested,
            onProjectSave,
            onProjectLoaded,
            onAuthenticationRequested,
            onAuthenticationExpired,
            onLogInfoRequested,
            onProjectGetDownloadLink,
            onConnectorAuthenticationRequested,
        } = config;

        const projectLoader = new StudioProjectLoader(
            projectId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            refreshTokenAction,
            projectDownloadUrl,
            projectUploadUrl,
            userInterfaceID,
        );
        const onBack = uiOptions?.widgets?.backButton?.event ?? defaultBackFn;
        return StudioUI.fullIntegrationConfig(
            selector,
            projectId,
            projectName,
            userInterfaceID,
            uiOptions ?? defaultPlatformUiOptions,
            uiTheme || 'light',
            outputSettings ?? defaultOutputSettings,
            sandboxMode || false,
            onSandboxModeToggle,
            onProjectInfoRequested ?? projectLoader.onProjectInfoRequested,
            onProjectDocumentRequested ?? projectLoader.onProjectDocumentRequested,
            onProjectSave ?? projectLoader.onProjectSave,
            onProjectLoaded ?? projectLoader.onProjectLoaded,
            onAuthenticationRequested ?? projectLoader.onAuthenticationRequested,
            onAuthenticationExpired ?? projectLoader.onAuthenticationExpired,
            onBack,
            onLogInfoRequested ?? projectLoader.onLogInfoRequested,
            onProjectGetDownloadLink ?? projectLoader.onProjectGetDownloadLink,
            editorLink,
            projectLoader.onFetchOutputSettings,
            projectLoader.onFetchUserInterfaces,
            onConnectorAuthenticationRequested,
            graFxStudioEnvironmentApiBaseUrl,
        );
    }
}

// Make this class accessible on window
window.StudioUI = StudioUI;

import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from './App';
import { StudioProjectLoader } from './StudioProjectLoader';
import './index.css';
import {
    defaultBackFn,
    defaultOutputSettings,
    defaultPlatformUiOptions,
    defaultUiOptions,
    IDefaultStudioUILoaderConfig,
    IStudioUILoaderConfig,
    ProjectConfig,
} from './types/types';

export default class StudioUI {
    protected root: Root | undefined;

    constructor(selector: string, projectConfig: ProjectConfig) {
        const container = document.getElementById(selector || 'sui-root');
        this.root = createRoot(container!);
        this.root.render(
            <React.StrictMode>
                <App projectConfig={projectConfig} />
            </React.StrictMode>,
        );
    }

    destroy() {
        if (this.root) {
            // eslint-disable-next-line no-console
            console.warn('Destroying studio ui component...');
            this.root.unmount();
            this.root = undefined;
        }
    }

    /**
     * Creates a new instance of StudioUI with all integration points available.
     * @param selector - The selector for the root element of the UI.
     * @param projectConfig - The configuration of the project
     * @returns
     */
    private static fullIntegrationConfig(selector: string, projectConfig: ProjectConfig) {
        return new StudioUI(selector, projectConfig);
    }

    /**
     * Creates a new instance of StudioUI with the default project loader and authentication based on the fullIntegration.
     * @param selector - The selector for the root element of the UI.
     * @param projectId - The id of the project to load.
     * @param graFxStudioEnvironmentApiBaseUrl - Environment API url to get the project info.
     * @param authToken - Environment API authentication token.
     * @param refreshTokenAction - Callback to refresh the authentication token.
     * @returns
     */
    static defaultStudioUILoaderConfig(config: IDefaultStudioUILoaderConfig) {
        const { selector, projectId, graFxStudioEnvironmentApiBaseUrl, authToken, refreshTokenAction, editorLink } =
            config;

        const projectLoader = new StudioProjectLoader(
            projectId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            false,
            refreshTokenAction,
        );

        return this.fullIntegrationConfig(selector, {
            projectId,
            outputSettings: defaultOutputSettings,
            uiOptions: { ...defaultUiOptions, uiTheme: 'light' },
            onProjectInfoRequested: projectLoader.onProjectInfoRequested,
            onProjectDocumentRequested: projectLoader.onProjectDocumentRequested,
            onProjectSave: projectLoader.onProjectSave,
            onProjectLoaded: projectLoader.onProjectLoaded,
            onAuthenticationRequested: projectLoader.onAuthenticationRequested,
            onAuthenticationExpired: projectLoader.onAuthenticationExpired,
            onLogInfoRequested: projectLoader.onLogInfoRequested,
            onProjectGetDownloadLink: projectLoader.onProjectGetDownloadLink,
            onFetchOutputSettings: projectLoader.onFetchOutputSettings,
            onFetchUserInterfaces: projectLoader.onFetchUserInterfaces,
            onBack: defaultBackFn,
            graFxStudioEnvironmentApiBaseUrl,
            overrideEngineUrl: editorLink,
        });
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
            featureFlags,
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
            customElement,
            onSetMultiLayout,
            onVariableFocus,
            onVariableBlur,
        } = config;

        const projectLoader = new StudioProjectLoader(
            projectId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            sandboxMode || false,
            refreshTokenAction,
            projectDownloadUrl,
            projectUploadUrl,
            userInterfaceID,
        );
        const onBack = uiOptions?.widgets?.backButton?.event ?? defaultBackFn;
        const uiOptionsConfig = uiOptions ?? defaultPlatformUiOptions;

        return this.fullIntegrationConfig(selector, {
            projectId,
            projectName,
            userInterfaceID,
            graFxStudioEnvironmentApiBaseUrl,
            outputSettings: outputSettings ?? defaultOutputSettings,
            uiOptions: { ...uiOptionsConfig, uiTheme: uiTheme || 'light' },
            featureFlags,
            sandboxMode: sandboxMode || false,
            onSandboxModeToggle,
            onProjectInfoRequested: onProjectInfoRequested ?? projectLoader.onProjectInfoRequested,
            onProjectDocumentRequested: onProjectDocumentRequested ?? projectLoader.onProjectDocumentRequested,
            onProjectSave: onProjectSave ?? projectLoader.onProjectSave,
            onProjectLoaded: onProjectLoaded ?? projectLoader.onProjectLoaded,
            onAuthenticationRequested: onAuthenticationRequested ?? projectLoader.onAuthenticationRequested,
            onAuthenticationExpired: onAuthenticationExpired ?? projectLoader.onAuthenticationExpired,
            onLogInfoRequested: onLogInfoRequested ?? projectLoader.onLogInfoRequested,
            onProjectGetDownloadLink: onProjectGetDownloadLink ?? projectLoader.onProjectGetDownloadLink,
            onFetchOutputSettings: projectLoader.onFetchOutputSettings,
            onFetchUserInterfaces: projectLoader.onFetchUserInterfaces,
            onConnectorAuthenticationRequested,
            overrideEngineUrl: editorLink,
            onBack,
            customElement,
            onSetMultiLayout,
            onVariableFocus,
            onVariableBlur,
        });
    }
}

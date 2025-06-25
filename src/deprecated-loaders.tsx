import { ITheme } from '@chili-publish/grafx-shared-components';
import { AxiosResponse } from 'axios';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { DemoDocumentLoader } from './DemoDocumentLoader';
import { StudioProjectLoader } from './StudioProjectLoader';
import './index.css';
import { setupStore } from './store';
import { ConnectorAuthenticationResult } from './types/ConnectorAuthenticationResult';
import {
    defaultBackFn,
    defaultOutputSettings,
    defaultPlatformUiOptions,
    defaultUiOptions,
    DownloadLinkResult,
    OutputSettings,
    PaginatedResponse,
    Project,
    ProjectConfig,
    StudioConfig,
    UiOptions,
    UserInterface,
    UserInterfaceWithOutputSettings,
} from './types/types';
import { VariableTranslations } from './types/VariableTranslations';
import { LayoutTranslations } from './types/LayoutTranslations';

type UiThemeType = { uiTheme: ITheme['mode'] | 'system' };

export type AppConfig = {
    variableTranslations?: VariableTranslations;
    layoutTranslations?: LayoutTranslations;
};

export default class StudioUILoader {
    protected root: Root | undefined;

    constructor(selector: string, projectConfig: ProjectConfig, appConfig: AppConfig = {}) {
        const container = document.getElementById(selector || 'sui-root');

        if (this.root) {
            throw new Error(
                'Studio UI component is already instantiated. Destroy first, if you wanna to mount a new one',
            );
        }

        const store = setupStore({
            appConfig,
        });
        this.root = createRoot(container!);
        this.root.render(
            <React.StrictMode>
                <Provider store={store}>
                    <App projectConfig={projectConfig} />
                </Provider>
            </React.StrictMode>,
        );
    }

    destroy() {
        if (this.root) {
            // eslint-disable-next-line no-console
            console.warn('Destroying Studio UI component...');
            this.root.unmount();
            this.root = undefined;
        }
    }

    /**
     * @deprecated The defaultConfigWithEditorLink method is deprecated and will be removed in a future version.
     * Creates a new instance of StudioUI with with the demo document loaded.
     * @param selector - The selector for the root element of the UI.
     * @param editorLink - Url to the engine /web folder
     * @returns A new instance of StudioUI.
     */
    static defaultConfigWithEditorLink(selector: string, editorLink: string) {
        const demoDocumentLoader = new DemoDocumentLoader(editorLink);

        return new StudioUILoader(selector, {
            projectId: 'demo',
            projectName: 'Demo',
            uiOptions: defaultUiOptions,
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
            onBack: () => {
                // ignored
            },
            onLogInfoRequested: demoDocumentLoader.onLogInfoRequested,
            onProjectGetDownloadLink: demoDocumentLoader.onProjectGetDownloadLink,
            editorLink,
        });
    }

    /**
     * @deprecated The fullIntegrationConfig method is deprecated and will be removed in a future version.
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
        projectId: string | undefined,
        projectName: string,
        userInterfaceID: string | undefined,
        uiOptions: UiOptions,
        uiTheme: ITheme['mode'] | 'system',
        outputSettings: OutputSettings,
        sandboxMode: boolean,
        featureFlags: Record<string, boolean> | undefined,
        onSandboxModeToggle: (() => void) | undefined,
        onProjectInfoRequested: (projectId?: string) => Promise<Project>,
        onProjectDocumentRequested: (projectId?: string) => Promise<string | null>,
        onProjectSave: (generateJson: () => Promise<string>) => Promise<Project>,
        onProjectLoaded: (project: Project) => void,
        onAuthenticationRequested: () => string,
        onAuthenticationExpired: () => Promise<string>,
        onBack: () => void,
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
        customElement?: HTMLElement | string,
        onSetMultiLayout?: (setMultiLayout: React.Dispatch<React.SetStateAction<boolean>>) => void,
        onVariableFocus?: (variableId: string) => void,
        onVariableBlur?: (variableId: string) => void,
        graFxStudioEnvironmentApiBaseUrl = '',
    ) {
        return new StudioUILoader(selector, {
            projectId,
            projectName,
            userInterfaceID,
            uiOptions: { ...uiOptions, uiTheme },
            outputSettings,
            graFxStudioEnvironmentApiBaseUrl,
            sandboxMode,
            featureFlags,
            onSandboxModeToggle,
            onProjectInfoRequested,
            onProjectDocumentRequested,
            onProjectLoaded,
            onProjectSave,
            onAuthenticationRequested,
            onAuthenticationExpired,
            onBack,
            onLogInfoRequested,
            onProjectGetDownloadLink,
            editorLink,
            onFetchOutputSettings,
            onFetchUserInterfaces,
            onConnectorAuthenticationRequested,
            customElement,
            onSetMultiLayout,
            onVariableFocus,
            onVariableBlur,
        });
    }

    /**
     * @deprecated The studioLoaderConfig method is deprecated and will be removed in a future version.
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
        config: Omit<StudioConfig, 'onProjectInfoRequested' | 'onProjectDocumentRequested' | 'onProjectSave'> &
            UiThemeType,
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
            featureFlags,
            onSandboxModeToggle,
            refreshTokenAction,
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

        return StudioUILoader.fullIntegrationConfig(
            selector,
            projectId,
            projectName,
            userInterfaceID,
            uiOptions ?? defaultPlatformUiOptions,
            uiTheme ?? 'light',
            outputSettings ?? defaultOutputSettings,
            sandboxMode || false,
            featureFlags,
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
            customElement,
            onSetMultiLayout,
            onVariableFocus,
            onVariableBlur,
            graFxStudioEnvironmentApiBaseUrl,
        );
    }

    /**
     * @deprecated The studioLoaderCustomTemplateConfig method is deprecated and will be removed in a future version.
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
    static studioLoaderCustomTemplateConfig(config: StudioConfig & UiThemeType) {
        const {
            selector,
            projectId,
            projectName,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            sandboxMode,
            featureFlags,
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
            sandboxMode || false,
            refreshTokenAction,
        );

        return StudioUILoader.fullIntegrationConfig(
            selector,
            projectId,
            projectName,
            undefined,
            uiOptions || defaultUiOptions,
            uiTheme || 'light',
            outputSettings || defaultOutputSettings,
            sandboxMode || false,
            featureFlags,
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
}

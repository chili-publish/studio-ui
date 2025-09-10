import { Root } from 'react-dom/client';
import {
    Configuration,
    ConnectorsApi,
    ProjectsApi,
    UserInterfacesApi,
    SettingsApi,
    OutputApi,
} from '@chili-publish/environment-client-api';
import { StudioProjectLoader } from './StudioProjectLoader';
import StudioUILoader, { AppConfig } from './deprecated-loaders';
import './index.css';
import {
    defaultBackFn,
    defaultOutputSettings,
    defaultPlatformUiOptions,
    IDefaultStudioUILoaderConfig,
    IStudioUILoaderConfig,
    ProjectConfig,
} from './types/types';

// Helper function to initialize environment client APIs
function initializeEnvironmentClientApis(
    graFxStudioEnvironmentApiBaseUrl: string,
    tokenProvider: () => string,
): {
    connectorsApi: ConnectorsApi;
    projectsApi: ProjectsApi;
    userInterfacesApi: UserInterfacesApi;
    settingsApi: SettingsApi;
    outputApi: OutputApi;
    environment: string;
} {
    // Extract environment name from the base URL
    const [, ...rest] = graFxStudioEnvironmentApiBaseUrl.split('/environment/');
    const environment = rest.pop() ?? '';

    let apiBasePath: string;
    if (graFxStudioEnvironmentApiBaseUrl.includes('/environment/')) {
        const [baseUrlPart] = graFxStudioEnvironmentApiBaseUrl.split('/environment/');
        // Remove /api/v1 from the base URL
        apiBasePath = baseUrlPart.replace('/api/v1', '');
    } else {
        apiBasePath = graFxStudioEnvironmentApiBaseUrl.replace('/api/v1', '');
    }

    const config = new Configuration({
        basePath: apiBasePath,
        accessToken: tokenProvider,
    });

    // Initialize all API instances
    return {
        connectorsApi: new ConnectorsApi(config),
        projectsApi: new ProjectsApi(config),
        userInterfacesApi: new UserInterfacesApi(config),
        settingsApi: new SettingsApi(config),
        outputApi: new OutputApi(config),
        environment,
    };
}

export default class StudioUI extends StudioUILoader {
    protected root: Root | undefined;

    /**
     * Creates a new instance of StudioUI with all integration points available.
     * @param selector - The selector for the root element of the UI.
     * @param projectConfig - The configuration of the project
     * @returns
     */
    private static fullStudioIntegrationConfig(selector: string, projectConfig: ProjectConfig, appConfig?: AppConfig) {
        return new StudioUI(selector, projectConfig, appConfig);
    }

    /**
     * Creates a new instance of StudioUI with the default project loader and authentication.
     * @param selector - The selector for the root element of the UI.
     * @param projectId - The id of the project to load.
     * @param graFxStudioEnvironmentApiBaseUrl - Environment API url to get the project info.
     * @param authToken - Environment API authentication token.
     * @param refreshTokenAction - Callback to refresh the authentication token.
     * @param editorLink - Url to the engine /web folder
     * @returns
     */
    static defaultStudioUILoaderConfig(config: IDefaultStudioUILoaderConfig) {
        const { selector, projectId, graFxStudioEnvironmentApiBaseUrl, authToken, refreshTokenAction, editorLink } =
            config;

        // Create a token provider that will always return the current token
        let currentToken = authToken;
        const tokenProvider = () => currentToken;

        // Create a refresh token action that also updates the token provider
        const enhancedRefreshTokenAction = refreshTokenAction
            ? async () => {
                  const result = await refreshTokenAction();
                  if (result instanceof Error) {
                      return result;
                  }
                  // Update the current token so the token provider returns the new token
                  currentToken = result;
                  return result;
              }
            : undefined;

        // Initialize environment client APIs with token provider
        const environmentClientApis = initializeEnvironmentClientApis(graFxStudioEnvironmentApiBaseUrl, tokenProvider);

        const projectLoader = new StudioProjectLoader(
            projectId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            false,
            environmentClientApis,
            enhancedRefreshTokenAction,
        );

        return this.fullStudioIntegrationConfig(selector, {
            projectId,
            outputSettings: defaultOutputSettings,
            uiOptions: defaultPlatformUiOptions,
            onProjectInfoRequested: projectLoader.onProjectInfoRequested,
            onProjectDocumentRequested: projectLoader.onProjectDocumentRequested,
            onProjectSave: projectLoader.onProjectSave,
            onEngineInitialized: projectLoader.onEngineInitialized,
            onAuthenticationRequested: projectLoader.onAuthenticationRequested,
            onAuthenticationExpired: projectLoader.onAuthenticationExpired,
            onLogInfoRequested: projectLoader.onLogInfoRequested,
            onProjectGetDownloadLink: projectLoader.onProjectGetDownloadLink,
            onFetchOutputSettings: projectLoader.onFetchOutputSettings,
            onFetchUserInterfaces: projectLoader.onFetchUserInterfaces,
            onBack: defaultBackFn,
            graFxStudioEnvironmentApiBaseUrl,
            editorLink,
            environmentClientApis,
        });
    }

    /**
     * Creates a new instance of StudioUI with the default project loader and authentication based on the fullIntegration.
     * if an optional callback is provided f.e onProjectInfoRequested it will be used instead of the default one
     * @param selector - The selector for the root element of the UI.
     * @param projectDownloadUrl - Environment API url to download the project.
     * @param projectUploadUrl - Environment API url to upload the project.
     * @param projectId - The id of the project to load.
     * @param projectName - The name of the project to load.
     * @param graFxStudioEnvironmentApiBaseUrl - Environment API url to get the project info.
     * @param editorLink - Url to the engine /web folder
     * @param authToken - Environment API authentication token.
     * @param uiOptions - The configuration of ui widgets and theming.
     * @param refreshTokenAction - Callback to refresh the authentication token.
     * @param onBack - Callback when the user clicks the back button.
     * @param outputSettings - The flags to manage the available types of outputs.
     * @param userInterfaceID - The id of the user interface used to fetch output settings, when passed outputSettings is ignored.
     * @param sandboxMode - Flag to open the project in sandbox mode.
     * @param onSandboxModeToggle - Callback when user switches sandbox mode.
     * @param onProjectInfoRequested - Callback to get the project info.
     * @param onProjectDocumentRequested - Callback to get the project template.
     * @param onProjectSave - Callback to save the project.
     * @param onProjectLoaded - Callback when the project is loaded. use this to set the configuration values on sdk.
     * @param onAuthenticationRequested - Callback to get the authentication token.
     * @param onAuthenticationExpired - Callback to refresh the authentication token.
     * @param onLogInfoRequested - Callback used to generate loading info in the console.
     * @param onProjectGetDownloadLink - Callback to get the output download link for the project.
     * @param onConnectorAuthenticationRequested - Callback to authenticate in custom connectors.
     * @param customElement - HTML element that is rendered in multiLayout mode.
     * @param onSetMultiLayout - Callback used to switch from single to multiLayout mode.
     * @param onVariableFocus - Callback which returns the id of the currently focused variable.
     * @param onVariableBlur - Callback which returns the id of the currently blurred variable.
     * @param onFetchUserInterfaceDetails - Callback to get the user interface details if userInterfaceID is provided.
     * @param variableTranslations - Translations for the variables.
     * @param uiTranslations - Translations for the UI.
     * @param layoutTranslations - Translations for the layout.
     * @returns
     */
    static studioUILoaderConfig(config: IStudioUILoaderConfig) {
        const {
            selector,
            projectDownloadUrl,
            projectUploadUrl,
            projectId,
            projectName,
            graFxStudioEnvironmentApiBaseUrl,
            editorLink,
            authToken,
            refreshTokenAction,
            uiOptions,
            outputSettings,
            userInterfaceID,
            featureFlags,
            sandboxMode,
            variableTranslations,
            uiTranslations,
            layoutTranslations,
            onSandboxModeToggle,
            onProjectInfoRequested,
            onProjectDocumentRequested,
            onProjectLoaded,
            onProjectSave,
            onEngineInitialized,
            onAuthenticationRequested,
            onAuthenticationExpired,
            onLogInfoRequested,
            onProjectGetDownloadLink,
            onConnectorAuthenticationRequested,
            customElement,
            onSetMultiLayout,
            onVariableFocus,
            onVariableBlur,
            userInterfaceFormBuilderData,
            onFetchUserInterfaceDetails,
            onVariableValueChangedCompleted,
        } = config;

        // Create a token provider that will always return the current token
        let currentToken = authToken;
        const tokenProvider = () => currentToken;

        // Create a refresh token action that also updates the token provider
        const enhancedRefreshTokenAction = refreshTokenAction
            ? async () => {
                  const result = await refreshTokenAction();
                  if (result instanceof Error) {
                      return result;
                  }
                  // Update the current token so the token provider returns the new token
                  currentToken = result;
                  return result;
              }
            : undefined;

        // Initialize environment client APIs with token provider
        const environmentClientApis = initializeEnvironmentClientApis(graFxStudioEnvironmentApiBaseUrl, tokenProvider);

        const projectLoader = new StudioProjectLoader(
            projectId,
            graFxStudioEnvironmentApiBaseUrl,
            authToken,
            sandboxMode || false,
            environmentClientApis,
            enhancedRefreshTokenAction,
            projectDownloadUrl,
            projectUploadUrl,
            userInterfaceID,
            onFetchUserInterfaceDetails,
        );

        const onBack = uiOptions?.widgets?.backButton?.event ?? defaultBackFn;
        const uiOptionsConfig = uiOptions ?? defaultPlatformUiOptions;

        return this.fullStudioIntegrationConfig(
            selector,
            {
                projectId,
                projectName,
                userInterfaceID,
                userInterfaceFormBuilderData,
                graFxStudioEnvironmentApiBaseUrl,
                outputSettings: outputSettings ?? defaultOutputSettings,
                uiOptions: {
                    ...uiOptionsConfig,
                    uiTheme: uiOptionsConfig.uiTheme || 'light',
                },
                featureFlags,
                sandboxMode: sandboxMode || false,
                onSandboxModeToggle,
                onProjectInfoRequested: onProjectInfoRequested ?? projectLoader.onProjectInfoRequested,
                onProjectDocumentRequested: onProjectDocumentRequested ?? projectLoader.onProjectDocumentRequested,
                onProjectSave: onProjectSave ?? projectLoader.onProjectSave,
                onEngineInitialized: onEngineInitialized ?? projectLoader.onEngineInitialized,
                onAuthenticationRequested: onAuthenticationRequested ?? projectLoader.onAuthenticationRequested,
                onAuthenticationExpired: onAuthenticationExpired ?? projectLoader.onAuthenticationExpired,
                onLogInfoRequested: onLogInfoRequested ?? projectLoader.onLogInfoRequested,
                onProjectGetDownloadLink: onProjectGetDownloadLink ?? projectLoader.onProjectGetDownloadLink,
                onFetchOutputSettings: projectLoader.onFetchOutputSettings,
                onFetchUserInterfaces: projectLoader.onFetchUserInterfaces,
                onFetchUserInterfaceDetails: projectLoader.onFetchStudioUserInterfaceDetails,
                onConnectorAuthenticationRequested,
                editorLink,
                onBack,
                customElement,
                onSetMultiLayout,
                onVariableFocus,
                onVariableBlur,
                onVariableValueChangedCompleted,
                onProjectLoaded,
                environmentClientApis,
            },
            {
                variableTranslations,
                uiTranslations,
                layoutTranslations,
            },
        );
    }
}

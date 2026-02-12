// This is an entry point when running standalone version of studio workspace in dev mode
// It's not going to be bundled to the main `bundle.js` file

import StudioUI from '../main';
import { runIntegrationTests } from './integration-demos/integration';
import { IntegrationTokenManager } from './integration-demos/integration-token-manager';
import { TemplateManager } from './template-manager';
import { TokenManager } from './token-manager';
import { EngineVersionManager } from './version-manager';

(async () => {
    let urlParams = new URLSearchParams(window.location.search);
    const integrationTest = urlParams.get('demo') === 'integration';

    const tokenManager = integrationTest ? new IntegrationTokenManager() : new TokenManager();

    // state after redirection
    if (urlParams.has('code') && !integrationTest) {
        const res = await (tokenManager as TokenManager).redirectCallback();
        if (res.appState) {
            window.history.replaceState(null, '', res.appState.returnTo);
            urlParams = new URLSearchParams(window.location.search);
        }
    }

    let authToken = '';
    if (import.meta.env.VITE_TOKEN) {
        authToken = import.meta.env.VITE_TOKEN;
    } else {
        authToken = await tokenManager.getAccessToken();
    }

    const engineVersionManager = new EngineVersionManager(authToken);

    const engineVersion = urlParams.get('engine') ?? 'main';
    let engineCommitSha =
        urlParams.get('engineCommitSha') ?? (await engineVersionManager.getLatestCommitSha(engineVersion));

    // The following will take released versions in consideration
    const engineRegex = /^\d+\.\d+\.\d+$/;

    const envName = import.meta.env.VITE_ENVIRONMENT_NAME;
    const projectId = import.meta.env.VITE_PROJECT_ID;

    // Sandbox mode environment variables
    const sandboxMode = import.meta.env.VITE_SANDBOX_MODE === 'true';
    const templateId = import.meta.env.VITE_TEMPLATE_ID;

    const baseUrl =
        import.meta.env.VITE_BASE_ENVIRONMENT_API_URL ??
        `https://${envName}.cpstaging.online/grafx/api/v1/environment/${envName}`; // Or different baseUrl

    engineCommitSha = integrationTest && !engineCommitSha ? 'latest' : engineCommitSha;
    const engineSource = engineRegex.test(engineVersion) ? engineVersion : `${engineVersion}-${engineCommitSha}`;

    // Base configuration shared between regular and sandbox modes
    const baseConfig = {
        selector: 'sui-root',
        graFxStudioEnvironmentApiBaseUrl: `${baseUrl}`,
        authToken,
        editorLink: `https://stgrafxstudiodevpublic.blob.core.windows.net/editor/${engineSource}/web`,
        refreshTokenAction: () =>
            integrationTest ? tokenManager.getAccessToken() : (tokenManager as TokenManager).refreshToken(),
        onConnectorAuthenticationRequested: (connectorId: string) => {
            return Promise.reject(new Error(`Authorization failed for ${connectorId}`));
        },
        // Feature flags are now fetched from URL-based config
        featureFlagConfigURL: 'https://chiligrafx-main.com/feature-flags.json',
        // eslint-disable-next-line no-console
        onVariableFocus: (id: string) => console.log('focused var: ', id),
        // eslint-disable-next-line no-console
        onVariableBlur: (id: string) => console.log('blurred var: ', id),
        // eslint-disable-next-line no-console, @typescript-eslint/no-explicit-any
        onVariableValueChangedCompleted: async (id: string, value: any) => console.log('changed var: ', id, value),
        // eslint-disable-next-line no-console
        onProjectLoaded: () => console.log('project loaded'),
    };

    if (integrationTest) {
        runIntegrationTests(baseConfig);
        return;
    }

    // Validation for regular mode
    if (!sandboxMode && ((!engineRegex.test(engineVersion) && !engineCommitSha) || !envName || !projectId)) {
        let messageString = `Please make sure to specify the`;
        if (!engineCommitSha) {
            messageString += ` engineCommitSha`;
        }
        if (!envName) {
            messageString += ` envName`;
        }
        if (!projectId) {
            messageString += ` projectId`;
        }

        alert(messageString);

        return;
    }

    // Validation for sandbox mode
    if (sandboxMode && (!envName || !templateId)) {
        let messageString = `Please make sure to specify the`;
        if (!envName) {
            messageString += ` envName`;
        }
        if (!templateId) {
            messageString += ` templateId`;
        }

        alert(messageString);

        return;
    }

    if (sandboxMode) {
        const templateManager = new TemplateManager(authToken, baseUrl, templateId);
        // Sandbox mode configuration
        StudioUI.studioUILoaderConfig({
            ...baseConfig,
            projectId: templateId,
            projectName: 'Sandbox mode',
            sandboxMode: true,
            userInterfaceID: undefined,
            uiOptions: {
                uiTheme: 'dark',
                widgets: {
                    downloadButton: { visible: true },
                    backButton: { visible: true },
                },
            },
            onSandboxModeToggle: () => {
                // eslint-disable-next-line no-console
                console.log('Sandbox mode toggle requested');
            },
            onProjectDocumentRequested: async () => {
                return JSON.stringify(await templateManager.getTemplateDocumentAsString());
            },
            onProjectInfoRequested: async () => ({
                id: templateId,
                name: 'Sandbox mode',
                template: {
                    id: templateId,
                },
            }),
        });
    } else {
        // Regular mode configuration
        StudioUI.studioUILoaderConfig({
            ...baseConfig,
            projectId,
            projectName: 'Dev Run',
            uiOptions: {
                widgets: {
                    backButton: { visible: true },
                    navBar: { visible: true },
                    bottomBar: { visible: true },
                    downloadButton: { visible: true },
                },
            },
        });
    }
})();

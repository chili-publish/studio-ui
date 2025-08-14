// This is an entry point when running standalone version of studio workspace in dev mode
// It's not going to be bundled to the main `bundle.js` file

import axios from 'axios';
import StudioUI from '../main';
import { TokenManager } from './token-manager';
import { EngineVersionManager } from './version-manager';

(async () => {
    const tokenManager = new TokenManager();

    let urlParams = new URLSearchParams(window.location.search);

    // state after redirection
    if (urlParams.has('code')) {
        const res = await tokenManager.redirectCallback();
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
    const engineCommitSha =
        urlParams.get('engineCommitSha') ?? (await engineVersionManager.getLatestCommitSha(engineVersion));

    // The following will take released versions in consideration
    const engineRegex = /^\d+\.\d+\.\d+$/;

    const envName = import.meta.env.VITE_ENVIRONMENT_NAME;
    const projectId = import.meta.env.VITE_PROJECT_ID;

    const baseUrl =
        import.meta.env.VITE_BASE_ENVIRONMENT_API_URL ??
        `https://${envName}.cpstaging.online/grafx/api/v1/environment/${envName}`; // Or different baseUrl

    if ((!engineRegex.test(engineVersion) && !engineCommitSha) || !envName || !projectId) {
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
        // eslint-disable-next-line no-alert
        alert(messageString);

        return;
    }

    const engineSource = engineRegex.test(engineVersion) ? engineVersion : `${engineVersion}-${engineCommitSha}`;

    StudioUI.studioUILoaderConfig({
        selector: 'sui-root',
        projectId,
        projectName: 'Dev Run',
        graFxStudioEnvironmentApiBaseUrl: `${baseUrl}`,
        authToken,
        editorLink: `https://stgrafxstudiodevpublic.blob.core.windows.net/editor/${engineSource}/web`,
        refreshTokenAction: () => tokenManager.refreshToken(),
        onConnectorAuthenticationRequested: (connectorId) => {
            return Promise.reject(new Error(`Authorization failed for ${connectorId}`));
        },
        userInterfaceID: undefined,
        sandboxMode: true,
        uiOptions: {
            uiTheme: 'dark',
            widgets: {
                downloadButton: { visible: true },
                backButton: { visible: true, event: () => {} },
            },
        },
        featureFlags: {},
        // eslint-disable-next-line no-console
        onVariableFocus: (id) => console.log('focused var: ', id),
        // eslint-disable-next-line no-console
        onVariableBlur: (id) => console.log('blurred var: ', id),
        // eslint-disable-next-line no-console
        onVariableValueChangedCompleted: async (id, value) => console.log('changed var: ', id, value),

        onProjectDocumentRequested: async () => {
            const document = await axios.get(`${baseUrl}/templates/${projectId}/download`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            // in order to be compatible with the studioUi, we need to return a string
            return JSON.stringify(document.data);
        },
        onProjectInfoRequested: async () => ({
            id: '',
            name: '',
            template: {
                id: '',
            },
        }),
    });
})();

// This is an entry point when running standalone version of studio workspace in dev mode
// It's not going to be bundled to the main `bundle.js` file

import StudioUI from '../main';
import { TokenManager } from './token-manager';

(async () => {
    const tokenManager = new TokenManager();

    let urlParams = new URLSearchParams(window.location.search);

    // state after redirection
    if (urlParams.has('code') && urlParams.has('code')) {
        const res = await tokenManager.redirectCallback();
        if (res.appState) {
            window.history.replaceState(null, '', res.appState.returnTo);
            urlParams = new URLSearchParams(window.location.search);
        }
    }

    const engineVersion = urlParams.get('engine') ?? 'main';
    // When devloping locally make sure you change the engine commit hash, you can get it from opening studio in platform
    // or from engine github repo
    const engineCommitSha = urlParams.get('engineCommitSha') ?? import.meta.env.VITE_ENGINE_COMMIT_SHA ?? '';
    // The following will take released versions in consideration
    const engineRegex = /^\d+\.\d+\.\d+$/;
    const engineSource =
        engineRegex.test(engineVersion) || !engineCommitSha ? engineVersion : `${engineVersion}-${engineCommitSha}`;

    // Set the values to the url
    if (!urlParams.get('engine')) {
        window.history.replaceState(null, '', `${window.location.href}?engine=${engineVersion}`);
    }
    if (!urlParams.get('engineCommitSha') && !engineRegex.test(engineVersion)) {
        window.history.replaceState(null, '', `${window.location.href}&engineCommitSha=${engineCommitSha}`);
    }

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

    let authToken = '';
    if (import.meta.env.VITE_TOKEN) {
        authToken = import.meta.env.VITE_TOKEN;
    } else {
        authToken = await tokenManager.getAccessToken();
    }
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
        featureFlags: {
            STUDIO_LABEL_PROPERTY_ENABLED: true,
        },
    });
})();

// This is an entry point when running standalone version of studio workspace in dev mode
// It's not going to be bundled to the main `bundle.js` file

import axios from 'axios';
import { TokenManager } from './token-manager';
import { Authentified, ConnectorAuthenticationResult } from '../types/ConnectorAuthenticationResult';

(async () => {
    const tokenManager = new TokenManager();
    let popup: any;
    let promiseExecutor: any;
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

    const handler = function (e: MessageEvent) {
        // We're processing only events from redirect origin
        if (e.origin && baseUrl.startsWith(e.origin)) {
            try {
                const result = JSON.parse(e.data);
                if (result.type === 'AuthorizationComplete') {
                    popup?.close();
                    promiseExecutor?.res({
                        type: 'authentified',
                    });
                } else if (result.type === 'AuthorizationFailed') {
                    popup?.close();
                    promiseExecutor?.res({
                        type: 'error',
                        error: result.reason,
                    });
                } else {
                    promiseExecutor?.rej(`Something went wrong: ${JSON.stringify(result)}`);
                }
            } catch (error) {
                promiseExecutor?.rej(`Something went wrong: ${error}`);
            }
        }
    };

    window.addEventListener('message', handler);

    const onProjectInfoRequested = async () => {
        return {
            id: '',
            name: '',
            template: {
                id: '',
            },
        };
    };

    const buildRedirectUri = (baseUrl: string, connectorId: string) => {
        return `${baseUrl}/connectors/${connectorId}/auth/oauth-authorization-code/redirect`;
    };

    const buildAuthentinticationUrl = ({ baseUrl, client_id, scope, redirect_uri, state }: any) => {
        const url = new URL(baseUrl);
        const query = new URLSearchParams({
            // eslint-disable-next-line camelcase
            client_id,
            // eslint-disable-next-line camelcase
            redirect_uri,
            scope,
            // eslint-disable-next-line camelcase
            response_type: 'code',
            state,
        });
        // eslint-disable-next-line no-restricted-syntax
        for (const [paramKey, paramValue] of query) {
            url.searchParams.append(paramKey, paramValue);
        }
        return url.toString();
    };

    const runAuthentication = async (connectorId: string) => {
        const connectorsAuthInfoRes = await axios.get(
            `https://cp-qeb-191.cpstaging.online/grafx/api/v1/environment/cp-qeb-191/connectors/${connectorId}/auth/oauth-authorization-code`,
            {
                headers: { Authorization: `Bearer ${authToken}` },
            },
        );
        const userId = 'samlp|chili-publish-dev|5zPH9tpDkfYakh5ym0w-0DHe-mKIB8CiTYyqcnbAGEI';
        const subscriptionGuid = '57718ff6-81c8-4e9e-bbe8-3c4ec86cf184';
        const connectorsAuthInfo = connectorsAuthInfoRes.data;
        const authorizationUrl = buildAuthentinticationUrl({
            baseUrl: connectorsAuthInfo.authorizationEndpoint,
            client_id: connectorsAuthInfo.clientId,
            redirect_uri: buildRedirectUri(baseUrl, connectorId),
            scope: connectorsAuthInfo.scope,
            state: window.btoa(JSON.stringify({ userId, subscriptionId: subscriptionGuid })),
        });
        popup = window.open(authorizationUrl);
        /*return {
            type: 'authentified',
        } as Authentified;*/
    };

    const authenticate = (connectorId: string) => {
        return Promise.race([
            new Promise<ConnectorAuthenticationResult>((res, rej) => {
                promiseExecutor = { res, rej };
                runAuthentication(connectorId);
            }),
            new Promise<ConnectorAuthenticationResult>((res) => {
                setTimeout(() => {
                    res({
                        type: 'timeout',
                    });
                }, 60 * 1000);
            }),
        ]).finally(() => {
            // resetParams();
            popup = null;
        });
    };

    window.StudioUI.studioUILoaderConfig({
        selector: 'sui-root',
        projectId,
        projectName: 'Dev Run',
        graFxStudioEnvironmentApiBaseUrl: `${baseUrl}`,
        authToken,
        sandboxMode: true,
        uiTheme: 'dark',
        editorLink: `https://stgrafxstudiodevpublic.blob.core.windows.net/editor/${engineSource}/web`,
        refreshTokenAction: () => tokenManager.refreshToken(),
        onConnectorAuthenticationRequested: authenticate,
        onProjectDocumentRequested: async () => {
            const doc = await axios.get(
                `https://cp-qeb-191.cpstaging.online/grafx/api/v1/environment/cp-qeb-191/templates/${projectId}/download`,
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            return doc.data || '';
        },
        onProjectInfoRequested,
    });
})();

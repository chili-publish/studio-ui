// This is an entry point when running standalone version of studio workspace in dev mode
// It's not going to be bundled to the main `bundle.js` file

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
        uiOptions: {
            widgets: {
                backButton: { visible: true },
                navBar: { visible: true },
                bottomBar: { visible: true },
                downloadButton: { visible: true },
            },
            uiDirection: 'ltr',
        },
        sandboxMode: true,
        variableTranslations: {
            Background: {
                label: 'Фон',
                placeholder: 'Выберите фон',
            },
            Photo: {
                label: 'Фото товара',
                placeholder: 'Выберите фото товара',
            },
            Brand: {
                label: 'Название бренда',
                placeholder: 'Предоставьте название бренда',
                helpText: 'Это поможет нам идентифицировать ваш бренд',
            },
            Description: {
                label: 'Описание товара',
                placeholder: 'Опишите товар',
            },
            Price: {
                label: 'Цена',
                placeholder: 'Выберите цену товара',
            },
            'Available from': {
                label: 'Доступно с',
                placeholder: 'Выберите дату',
            },
            List: {
                label: 'Список',
                placeholder: 'Выберите элемент',
                listItems: {
                    First: 'Первый',
                    Second: 'Второй',
                    Third: 'Третий',
                },
            },
        },
        featureFlags: {},
        // eslint-disable-next-line no-console
        onVariableFocus: (id) => console.log('focused var: ', id),
        // eslint-disable-next-line no-console
        onVariableBlur: (id) => console.log('blurred var: ', id),
        // eslint-disable-next-line no-console
        onVariableValueChangedCompleted: async (id, value) => console.log('changed var: ', id, value),
    });
})();

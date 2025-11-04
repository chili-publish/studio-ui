// This is an entry point when running standalone version of studio workspace in dev mode
// It's not going to be bundled to the main `bundle.js` file
import { UiOptions } from 'src/types/types';
import StudioUI from 'src/main';
import { IntegrationTokenManager } from '../../integration-token-manager';
import { EngineVersionManager } from '../../version-manager';

(async () => {
    const tokenManager = new IntegrationTokenManager();

    const urlParams = new URLSearchParams(window.location.search);

    const authToken = await tokenManager.getAccessToken();

    const engineVersionManager = new EngineVersionManager(authToken);

    const engineVersion = urlParams.get('engine') ?? 'main';
    const engineCommitSha =
        urlParams.get('engineCommitSha') ?? (await engineVersionManager.getLatestCommitSha(engineVersion));

    // The following will take released versions in consideration
    const engineRegex = /^\d+\.\d+\.\d+$/;

    const envName = import.meta.env.VITE_ENVIRONMENT_NAME;
    const projectId = import.meta.env.VITE_INTEGRATION_PROJECT_ID;

    // Sandbox mode environment variables
    const sandboxMode = import.meta.env.VITE_SANDBOX_MODE === 'true';
    const templateId = import.meta.env.VITE_TEMPLATE_ID;

    const baseUrl =
        import.meta.env.VITE_BASE_ENVIRONMENT_API_URL ??
        `https://${envName}.cpstaging.online/grafx/api/v1/environment/${envName}`; // Or different baseUrl

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
        // eslint-disable-next-line no-alert
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
        // eslint-disable-next-line no-alert
        alert(messageString);

        return;
    }

    const engineSource = engineRegex.test(engineVersion) ? engineVersion : `${engineVersion}-${engineCommitSha}`;

    // Base configuration shared between regular and sandbox modes
    const baseConfig = {
        selector: 'studio-ui-container',
        graFxStudioEnvironmentApiBaseUrl: `${baseUrl}`,
        authToken,
        editorLink: `https://stgrafxstudiodevpublic.blob.core.windows.net/editor/${engineSource}/web`,
        refreshTokenAction: () => tokenManager.getAccessToken(),
        featureFlags: {},
        projectName: 'Test project name',
    };

    const uiOptions: UiOptions = {
        widgets: {
            navBar: {
                visible: false,
            },
        },
    };

    // injects the comic sans font on the body
    const style = document.createElement('style');
    style.textContent = 'body { font-family: Comic Sans MS, cursive, sans-serif; }';
    document.head.appendChild(style);

    StudioUI.studioUILoaderConfig({
        // Div id to inject studio-ui in
        selector: baseConfig.selector,
        // downloadUrl used to fetch the document
        projectDownloadUrl: `${baseUrl}/projects/${projectId}/document`,
        // uploadUrl used to save the changes you did to the document (autosave)
        projectUploadUrl: `${baseUrl}/projects/${projectId}`,
        // project Id to enable autosave
        projectId,
        /* environment base URL ex: https://cp-abc-123.chili-publish.online/grafx/api/v1/cp-abc-123 */
        graFxStudioEnvironmentApiBaseUrl: baseUrl,
        /* Integration access token */
        authToken: baseConfig.authToken,
        /* refreshTokenAction, being a function that will return a promise () => Promise<string | Error> */
        refreshTokenAction: baseConfig.refreshTokenAction,
        /* projectName: string, name of the project. Shown in the UI (does not have to be match the real name) */
        projectName: baseConfig.projectName,
        userInterfaceID: undefined,
        uiOptions,
    });
})();

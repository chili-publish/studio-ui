/* eslint-disable no-underscore-dangle */

import StudioUI from '../../main';
import { IntegrationTokenManager } from '../integration-token-manager';

(async () => {
    const tokenManager = new IntegrationTokenManager();

    StudioUI.studioUILoaderConfig({
        selector: 'studio-ui-container',
        ...(window.__PROJECT_CONFIG__ || {}),
        authToken: await tokenManager.getAccessToken(),
        refreshTokenAction: () => tokenManager.getAccessToken(),
    });
})();

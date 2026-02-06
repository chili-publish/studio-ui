/* eslint-disable no-underscore-dangle */

import { IStudioUILoaderConfig } from 'src/types/types';
import StudioUI from '../../main';
import { IntegrationTokenManager } from './integration-token-manager';

(async () => {
    const tokenManager = new IntegrationTokenManager();
    const projectConfig = window.__PROJECT_CONFIG__ || {};

    StudioUI.studioUILoaderConfig({
        ...projectConfig,
        selector: (projectConfig as IStudioUILoaderConfig)?.selector || 'studio-ui-container',
        authToken: await tokenManager.getAccessToken(),
        refreshTokenAction: () => tokenManager.getAccessToken(),
    } as IStudioUILoaderConfig);
})();

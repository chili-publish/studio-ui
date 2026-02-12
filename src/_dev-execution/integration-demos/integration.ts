/* eslint-disable no-underscore-dangle */

import { IStudioUILoaderConfig } from 'src/types/types';
import StudioUI from '../../main';
import { IntegrationTokenManager } from './integration-token-manager';

export const runIntegrationTests = async (baseConfig: IStudioUILoaderConfig) => {
    // eslint-disable-next-line no-console
    console.log('running integration tests');
    const tokenManager = new IntegrationTokenManager();
    const projectConfig = window.__PROJECT_CONFIG__ || {};

    StudioUI.studioUILoaderConfig({
        ...baseConfig,
        ...projectConfig,
        selector: (projectConfig as IStudioUILoaderConfig)?.selector || 'sui-root',
        authToken: await tokenManager.getAccessToken(),
        refreshTokenAction: () => tokenManager.getAccessToken(),
    } as IStudioUILoaderConfig);
};

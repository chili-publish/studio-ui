import { IStudioUILoaderConfig } from '../types/types';

/* Type declarations for global window properties */
declare global {
    interface Window {
        __PROJECT_CONFIG__?: IStudioUILoaderConfig;
        __INTEGRATION_CLIENT_ID?: string;
        __INTEGRATION_CLIENT_SECRET?: string;
    }
}

export {};

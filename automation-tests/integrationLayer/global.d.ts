import { IStudioUILoaderConfig } from 'src/types/types';

/* Type declarations for automation tests */
declare global {
    interface Window {
        __PROJECT_CONFIG__: IStudioUILoaderConfig;
        __INTEGRATION_CLIENT_ID?: string;
        __INTEGRATION_CLIENT_SECRET?: string;
    }
}

export {};

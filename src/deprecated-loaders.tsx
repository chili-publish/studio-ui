import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { setupStore } from './store';
import { ProjectConfig } from './types/types';
import { VariableTranslations } from './types/VariableTranslations';
import { UITranslations } from './types/UITranslations';
import { LayoutTranslations } from './types/LayoutTranslations';

export type AppConfig = {
    variableTranslations?: VariableTranslations;
    uiTranslations?: UITranslations;
    layoutTranslations?: LayoutTranslations;
};

export default class StudioUILoader {
    protected root: Root | undefined;

    constructor(
        selector: string,
        projectConfig: ProjectConfig,
        appConfig: AppConfig = {},
        onLoadError?: (error: Error) => void,
    ) {
        const container = document.getElementById(selector || 'sui-root');

        if (this.root) {
            throw new Error(
                'Studio UI component is already instantiated. Destroy first, if you wanna to mount a new one',
            );
        }

        const store = setupStore({
            appConfig,
        });
        this.root = createRoot(container!);
        this.root.render(
            <React.StrictMode>
                <Provider store={store}>
                    <App projectConfig={projectConfig} onLoadError={onLoadError} />
                </Provider>
            </React.StrictMode>,
        );
    }

    destroy() {
        if (this.root) {
            // eslint-disable-next-line no-console
            console.warn('Destroying Studio UI component...');
            this.root.unmount();
            this.root = undefined;
        }
    }
}

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

    protected store: ReturnType<typeof setupStore> | undefined;

    private container: HTMLElement | null = null;

    private selector: string;

    /**
     * Selectors that currently have a Studio UI mounted into them.
     *
     * This has to be tracked statically: the previous guard checked `this.root`, which is
     * always undefined on a freshly constructed instance, so it could never fire. A second
     * mount on the same container then silently created a second React root and a second
     * engine, leaving the first one running for the lifetime of the page.
     */
    private static mountedSelectors = new Set<string>();

    constructor(selector: string, projectConfig: ProjectConfig, appConfig: AppConfig = {}) {
        const resolvedSelector = selector || 'sui-root';
        const container = document.getElementById(resolvedSelector);

        if (StudioUILoader.mountedSelectors.has(resolvedSelector)) {
            throw new Error(
                'Studio UI component is already instantiated. Destroy first, if you wanna to mount a new one',
            );
        }

        this.selector = resolvedSelector;
        this.container = container;
        StudioUILoader.mountedSelectors.add(resolvedSelector);

        this.store = setupStore({
            appConfig,
        });
        this.root = createRoot(container!);
        this.root.render(
            <React.StrictMode>
                <Provider store={this.store}>
                    <App projectConfig={projectConfig} />
                </Provider>
            </React.StrictMode>,
        );
    }

    /**
     * Unmounts Studio UI and releases the engine it loaded.
     *
     * Unmounting alone is not enough: the engine iframe is appended imperatively by the
     * SDK, so anything left in the container after React is gone would keep the engine
     * realm (Dart heap, CanvasKit and QuickJS WASM memory) alive. Safe to call twice.
     */
    destroy() {
        if (!this.root) {
            return;
        }
        // eslint-disable-next-line no-console
        console.warn('Destroying Studio UI component...');

        // Unmount first: MainContent's cleanup tears the SDK connection down and removes
        // the engine iframe while it still knows which one belongs to this instance.
        this.root.unmount();

        // Anything the SDK appended outside of React's tree is dropped here.
        this.container?.replaceChildren();

        StudioUILoader.mountedSelectors.delete(this.selector);
        this.root = undefined;
        this.store = undefined;
        this.container = null;
    }
}

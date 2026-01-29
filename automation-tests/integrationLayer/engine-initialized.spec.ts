import { test, expect } from '../helpers/test-with-credentials';
import { getProjectConfig } from '../helpers/project.config';

test('engine initialized callback', async ({ page }) => {
    const projectConfig = { ...getProjectConfig({}) };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
        window.__ENGINE_INITIALIZED__ = false;
        window.__PROJECT_CONFIG__.onEngineInitialized = () => {
            window.__ENGINE_INITIALIZED__ = true;
        };
    `);

    await page.goto('');

    await page.waitForLoadState('networkidle');

    const engineInitializedProject = await page.evaluate(() => (window as any).__ENGINE_INITIALIZED__);
    expect(engineInitializedProject).toBe(true);
});

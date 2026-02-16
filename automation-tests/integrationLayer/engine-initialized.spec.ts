import { test, expect } from '@helpers';

const initScript = `
        window.__ENGINE_INITIALIZED__ = false;
        window.__PROJECT_CONFIG__.onEngineInitialized = () => {
            window.__ENGINE_INITIALIZED__ = true;
        };
    `;

test.use({ initScript });
test('engine initialized callback', async ({ page }) => {
    const engineInitializedProject = await page.evaluate(() => (window as any).__ENGINE_INITIALIZED__);
    expect(engineInitializedProject).toBe(true);
});

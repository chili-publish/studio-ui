import { test, expect } from '@playwright/test';
import { getProjectConfig } from '../helpers/project.config';
test('configure multi layout mode', async ({ page }) => {
    const projectConfig = { ...getProjectConfig({ customElement: '<div>Custom main element</div>' }) };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
        window.__PROJECT_CONFIG__.onSetMultiLayout = (fn) => {
            window.__SET_MULTI_LAYOUT_VIEW__ = fn;
        };
    `);

    await page.goto('/?demo=integration');

    await page.waitForLoadState('networkidle');

    // Wait for the callback to be set
    await page.waitForFunction(() => (window as any).__SET_MULTI_LAYOUT_VIEW__ !== undefined);

    // Enable multi-layout mode
    await page.evaluate(() => {
        if ((window as any).__SET_MULTI_LAYOUT_VIEW__) {
            (window as any).__SET_MULTI_LAYOUT_VIEW__(true);
        }
    });

    await expect(page.getByTestId('test-sui-canvas')).not.toBeVisible();
    expect(page.getByText('Custom main element')).toBeVisible();

    // Disable multi-layout mode
    await page.evaluate(() => {
        if ((window as any).__SET_MULTI_LAYOUT_VIEW__) {
            (window as any).__SET_MULTI_LAYOUT_VIEW__(false);
        }
    });

    await expect(page.getByTestId('test-sui-canvas')).toBeVisible();
    expect(page.getByText('Custom main element')).not.toBeVisible();
});

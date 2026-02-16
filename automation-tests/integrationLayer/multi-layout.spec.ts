import { test, expect, getProjectConfig } from '@helpers';

const initScript = `
        window.__PROJECT_CONFIG__.onSetMultiLayout = (fn) => {
            window.__SET_MULTI_LAYOUT_VIEW__ = fn;
        };
    `;
const projectConfig = { ...getProjectConfig({ customElement: '<div>Custom main element</div>' }) };

test.use({ initScript, projectConfig });
test('configure multi layout mode', async ({ page }) => {
    // Wait for the callback to be set
    await page.waitForFunction(() => (window as any).__SET_MULTI_LAYOUT_VIEW__ !== undefined);

    // Enable multi-layout mode
    await page.evaluate(() => {
        if ((window as any).__SET_MULTI_LAYOUT_VIEW__) {
            (window as any).__SET_MULTI_LAYOUT_VIEW__(true);
        }
    });

    await expect(page.getByTestId('test-sui-canvas')).not.toBeVisible();
    await expect(page.getByText('Custom main element')).toBeVisible();

    // Disable multi-layout mode
    await page.evaluate(() => {
        if ((window as any).__SET_MULTI_LAYOUT_VIEW__) {
            (window as any).__SET_MULTI_LAYOUT_VIEW__(false);
        }
    });

    await expect(page.getByTestId('test-sui-canvas')).toBeVisible();
    await expect(page.getByText('Custom main element')).not.toBeVisible();
});

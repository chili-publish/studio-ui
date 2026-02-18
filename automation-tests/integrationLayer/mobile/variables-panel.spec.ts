import { test, expect } from '@helpers';

test.describe('mobile UI tests', () => {
    test.beforeEach(({ browserName }, testInfo) => {
        const isMobile = testInfo.project.name.includes('mobile');
        if (!isMobile) test.skip(); // skip desktop
    });

    test('displays headings in the correct order', async ({ page }) => {
        await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

        await page.waitForTimeout(2000);

        const trayButton = page.getByTestId('test-sui-mobile-variables');
        await expect(trayButton).toBeVisible();
        await trayButton.click();

        const trayPanel = page.getByTestId('test-sui-tray-panel');
        await expect(trayPanel).toBeVisible();

        await expect(page.getByRole('heading', { name: 'Data source' })).toBeVisible();
        await expect(page.getByTestId('test-sui-tray-panel')).toMatchAriaSnapshot(`
            - text: Data row
            - textbox "data-source-input":
              - /placeholder: Select data row
              - text: /New Listing \\| 0b10af0f-\\d+-4e5e-a835-8642b23f3a28 \\| Charming house featuring 4 bedrooms, 3 bathrooms and a backyard \\| Beautiful property close to all amenities \\| 149c5d16-b1fa-4a44-a49d-f6bcd652515d \\| Janice Barrow \\| Real Estate Broker \\| \\d+-\\d+-\\d+ \\| chill\\.com\\/properties/
            - button
            - button [disabled]
            - text: Row 1
            - button
            - heading "Layouts"
            `);

        const headings = trayPanel.getByRole('heading');
        await expect(headings).toHaveCount(3);
        await expect(headings.nth(0)).toHaveText('Data source');
        await expect(headings.nth(1)).toHaveText('Layouts');
        await expect(headings.nth(2)).toHaveText('Customize');
    });
});

import { test, expect } from '../helpers/test-with-credentials';
import { getProjectConfig } from '../helpers/project.config';

test('custom user interface ID and onFetchUserInterfaceDetails callback', async ({ page }) => {
    const projectConfig = {
        ...getProjectConfig({
            userInterfaceID: 'custom-ui',
            uiOptions: { widgets: { downloadButton: { visible: true } } },
        }),
    };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
        window.__PROJECT_CONFIG__.onFetchUserInterfaceDetails = (userInterfaceId) => {
            return Promise.resolve({
                id: '1',
                name: 'Default Name',
                outputSettings: {
                        'ff4a8aa8-3486-41d5-8a28-899be2989a2c': {
                            layoutIntents: ['print', 'digitalStatic', 'digitalAnimated'],
                        },
                        'fad5a9fa-8d4f-4f73-b1e7-797779469fe9': {
                            layoutIntents: ['print', 'digitalAnimated'],
                        }
                },
            });
        };
    `);

    await page.goto('');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    const downloadButton = page.getByTestId('test-sui-navbar-item-download').getByTestId('test-gsc-button');
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toHaveText('Download');

    await downloadButton.click();

    const outputDropdown = page.getByTestId('test-sui-output-dropdown');

    await expect(outputDropdown).toBeVisible();
    await expect(outputDropdown.getByText('PNG')).toBeVisible();

    const dropdownIndicator = outputDropdown.getByTestId('test-gsc-drop-down-indicator-icon');
    await dropdownIndicator.click();

    await expect(page.getByRole('option', { name: 'PNG' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'cropmarks2' })).toBeVisible();
});

test('custom user interface ID', async ({ page }) => {
    const projectConfig = {
        ...getProjectConfig({
            userInterfaceID: '41a291d9-dd55-4281-a808-2633479d6275',
            uiOptions: { widgets: { downloadButton: { visible: true } } },
        }),
    };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`window.__PROJECT_CONFIG__ = ${configString};`);

    await page.goto('');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    const availableLayoutsInput = page.locator('#sui-dropdown-available-layout-label-with-icon-container');
    await expect(availableLayoutsInput).toBeVisible();
    const availableLayoutsSelect = page.locator('.grafx-select__control').nth(0);
    await availableLayoutsSelect.click();
    await page.locator('.grafx-select__option', { hasText: '2K' }).click();

    const downloadButton = page.getByTestId('test-sui-navbar-item-download').getByTestId('test-gsc-button');
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toHaveText('Download');

    await downloadButton.click();

    const outputDropdown = page.getByTestId('test-sui-output-dropdown');

    await expect(outputDropdown).toBeVisible();

    const dropdownIndicator = outputDropdown.getByTestId('test-gsc-drop-down-indicator-icon');
    await dropdownIndicator.click();

    await expect(page.getByRole('option', { name: 'MP4' })).toBeVisible();
});

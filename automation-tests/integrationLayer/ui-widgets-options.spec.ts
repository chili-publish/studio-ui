import { test, expect } from '@playwright/test';
import { UiOptions } from 'src/types/types';
import { getProjectConfig } from './helpers/project.config';

test('ui widget options (true)', async ({ page }) => {
    const uiOptions: UiOptions = {
        widgets: {
            downloadButton: {
                visible: true,
            },
            navBar: {
                visible: true,
            },
            bottomBar: {
                visible: true,
            },
            backButton: {
                visible: true,
            },
        },
    };
    const projectConfig = { ...getProjectConfig({ uiOptions }) };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
        window.__BACK_BUTTON_CALLED__ = false;
        window.__PROJECT_CONFIG__.uiOptions.widgets.backButton.event = () => {
            window.__BACK_BUTTON_CALLED__ = true;
        };
    `);

    await page.goto('/?demo=integration');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();
    await expect(page.locator('#studio-ui-container')).toBeVisible();
    await expect(page.getByTestId('test-sui-navbar-item-download').getByTestId('test-gsc-button')).toBeVisible();

    await page.getByTestId('test-gsc-back-btn').click();

    // Verify the callback was called
    const callbackCalled = await page.evaluate(() => (window as any).__BACK_BUTTON_CALLED__);
    expect(callbackCalled).toBe(true);

    // check if timeline is visible
    await page.getByTestId('test-gsc-drop-down-indicator-icon').click();
    await page.getByRole('option', { name: 'Facebook Square Ad' }).click();
    await expect(page.getByTestId('test-gsc-timeline')).toBeVisible();

    // check if navbar is visible
    await expect(page.getByTestId('test-sui-navbar')).toBeVisible();
});

test('ui widget options (false)', async ({ page }) => {
    const uiOptions: UiOptions = {
        widgets: {
            downloadButton: {
                visible: false,
            },
            backButton: {
                visible: false,
            },
            bottomBar: {
                visible: false,
            },
        },
    };
    const projectConfig = { ...getProjectConfig({ uiOptions }) };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
    `);

    await page.goto('/?demo=integration');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    // check if download button is not visible
    await expect(page.getByTestId('test-sui-navbar-item-download').getByTestId('test-gsc-button')).not.toBeVisible();

    // check if timeline is not visible
    await page.getByTestId('test-gsc-drop-down-indicator-icon').click();
    await page.getByRole('option', { name: 'Facebook Square Ad' }).click();
    await expect(page.getByTestId('test-gsc-timeline')).not.toBeVisible();

    // check if back button is not visible
    await expect(page.getByTestId('test-gsc-back-btn')).not.toBeVisible();
});

test('ui widget options (hide navbar)', async ({ page }) => {
    const uiOptions: UiOptions = {
        widgets: {
            navBar: {
                visible: false,
            },
        },
    };

    const projectConfig = { ...getProjectConfig({ uiOptions }) };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
    `);

    await page.goto('/?demo=integration');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Data source' })).toBeVisible();

    await expect(page.getByTestId('test-sui-navbar')).not.toBeVisible();
});

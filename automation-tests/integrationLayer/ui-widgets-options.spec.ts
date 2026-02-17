import { test, expect, getProjectConfig } from '@helpers';

const uiOptions = {
    allVisible: {
        widgets: {
            downloadButton: { visible: true },
            navBar: { visible: true },
            bottomBar: { visible: true },
            backButton: { visible: true },
        },
    },
    allHidden: {
        widgets: {
            downloadButton: { visible: false },
            backButton: { visible: false },
            bottomBar: { visible: false },
        },
    },
    hideNavBar: {
        widgets: {
            navBar: { visible: false },
        },
    },
};

const backButtonInitScript = `
    window.__BACK_BUTTON_CALLED__ = false;
    window.__PROJECT_CONFIG__.uiOptions.widgets.backButton.event = () => {
        window.__BACK_BUTTON_CALLED__ = true;
    };
`;

test.describe('UI widget options (all visible)', () => {
    const projectConfig = { ...getProjectConfig({ uiOptions: uiOptions.allVisible }) };
    test.use({ initScript: backButtonInitScript, projectConfig });
    test('should show all widgets and call backButton event', async ({ page }) => {
        await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();
        await expect(page.getByTestId('test-sui-navbar-item-download').getByTestId('test-gsc-button')).toBeVisible();

        await page.getByTestId('test-gsc-back-btn').click();

        // Verify the callback was called
        const callbackCalled = await page.evaluate(() => (window as any).__BACK_BUTTON_CALLED__);
        expect(callbackCalled).toBe(true);

        // check if timeline is visible
        await page.getByTestId('test-gsc-drop-down-indicator-icon').first().click();
        await page.getByRole('option', { name: 'Facebook Square Ad' }).click();
        await expect(page.getByTestId('test-gsc-timeline')).toBeVisible();

        // check if navbar is visible
        await expect(page.getByTestId('test-sui-navbar')).toBeVisible();
    });
});

test.describe('UI widget options (all hidden)', () => {
    const projectConfig = { ...getProjectConfig({ uiOptions: uiOptions.allHidden }) };
    test.use({ projectConfig });
    test('should hide download, back, and bottom bar widgets', async ({ page }) => {
        await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();
        await expect(
            page.getByTestId('test-sui-navbar-item-download').getByTestId('test-gsc-button'),
        ).not.toBeVisible();
        await page.getByTestId('test-gsc-drop-down-indicator-icon').first().click();
        await page.getByRole('option', { name: 'Facebook Square Ad' }).click();
        await expect(page.getByTestId('test-gsc-timeline')).not.toBeVisible();
        await expect(page.getByTestId('test-gsc-back-btn')).not.toBeVisible();
    });
});

test.describe('UI widget options (hide navbar)', () => {
    const projectConfig = { ...getProjectConfig({ uiOptions: uiOptions.hideNavBar }) };
    test.use({ projectConfig });
    test('should hide navbar widget', async ({ page }) => {
        await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Data source' })).toBeVisible();
        await expect(page.getByTestId('test-sui-navbar')).not.toBeVisible();
    });
});

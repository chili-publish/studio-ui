import { test, expect } from '@playwright/test';

test('ui widget options (true)', async ({ page }) => {
    await page.goto(
        'http://localhost:3002/?demo=ui-widget-true-options&engine=main&engineCommitSha=3963c4a3bb691757589caffaef9136222649551b',
    );
    await expect(page.getByTestId('test-sui-navbar-item-download').getByTestId('test-gsc-button')).toBeVisible();
    const consolePromise = page.waitForEvent('console');
    await page.getByTestId('test-gsc-back-btn').click();

    // Wait for and verify the console message
    const consoleMsg = await consolePromise;
    expect(consoleMsg.text()).toBe('back button pressed');

    // check if timeline is visible
    await page.getByTestId('test-gsc-drop-down-indicator-icon').click();
    await page.getByRole('option', { name: 'Facebook Square Ad' }).click();
    await expect(page.getByTestId('test-gsc-timeline')).toBeVisible();

    // check if navbar is visible
    await expect(page.getByTestId('test-sui-navbar')).toBeVisible();
});

test('ui widget options (false)', async ({ page }) => {
    await page.goto(
        'http://localhost:3002/?demo=ui-widget-false-options&engine=main&engineCommitSha=3963c4a3bb691757589caffaef9136222649551b',
    );
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
    await page.goto(
        'http://localhost:3002/?demo=ui-widget-hide-navbar-options&engine=main&engineCommitSha=3963c4a3bb691757589caffaef9136222649551b',
    );
    await expect(page.getByRole('heading', { name: 'Data source' })).toBeVisible();

    await expect(page.getByTestId('test-sui-navbar')).not.toBeVisible();
});

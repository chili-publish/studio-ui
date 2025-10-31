// eslint-disable-next-line import/no-extraneous-dependencies
import { test, expect } from '@playwright/test';

test('basic integration', async ({ page }) => {
    await page.goto(
        'http://localhost:3002/?demo=basic-integration&engine=main&engineCommitSha=3963c4a3bb691757589caffaef9136222649551b',
    );
    await expect(page.getByLabel('Project: Listing')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Data source' })).toBeVisible();
    await expect(page.getByText('Data row')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Layouts' })).toBeVisible();
    await expect(
        page
            .getByTestId('test-sui-dropdown-available-layout-label-with-icon-container')
            .getByTestId('test-gsc-input-label'),
    ).toBeVisible();
    await expect(page.getByText('Width')).toBeVisible();
    await expect(page.getByText('Height')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Customize' })).toBeVisible();
    await expect(page.getByTestId('test-sui-navbar')).toMatchAriaSnapshot(`
    - navigation:
      - list:
        - listitem "Project information":
          - button
        - listitem "Actions":
          - button
          - button [disabled]
        - listitem "Download":
          - button "Download"
        - listitem "Zoom":
          - button
          - button
    `);
});

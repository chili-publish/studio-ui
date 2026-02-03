import { test, expect } from '../helpers/test-with-credentials';

test('basic integration', async ({ page }) => {
    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();
    await expect(page.getByLabel('Project: Listing')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Data source' })).toBeVisible();
    await expect(page.getByText('Data row')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Layouts' })).toBeVisible();
    await expect(
        page
            .getByTestId('test-sui-dropdown-available-layout-label-with-icon-container')
            .getByTestId('test-gsc-input-label'),
    ).toBeVisible();
    // await expect(page.getByText('Width')).toBeVisible();
    // await expect(page.getByText('Height')).toBeVisible();
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
    await expect(page.getByTestId('test-gsc-scrollbar-wrapper')).toMatchAriaSnapshot(`
      - text: Data row
      - textbox "data-source-input":
        - /placeholder: Select data row
        - text: /New Listing \\| 0b10af0f-\\d+-4e5e-a835-8642b23f3a28 \\| Charming house featuring 4 bedrooms, 3 bathrooms and a backyard \\| Beautiful property close to all amenities \\| 149c5d16-b1fa-4a44-a49d-f6bcd652515d \\| Janice Barrow \\| Real Estate Broker \\| \\d+-\\d+-\\d+ \\| chill\\.com\\/properties/
      - button
      `);
});

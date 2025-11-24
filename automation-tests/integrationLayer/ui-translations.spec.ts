import { test, expect } from '@playwright/test';
import { getProjectConfig } from '../helpers/project.config';
test('ui translations', async ({ page }) => {
    const uiTranslations = {
        toolBar: {
            hamburgerMenu: {
                backToTemplatesItemLabel: 'Go back',
                fileMenuItem: {
                    options: {
                        saveItemLabel: 'Save project',
                    },
                },
            },
        },
    };
    const projectConfig = { ...getProjectConfig({ uiTranslations, sandboxMode: true }) };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
    `);

    await page.goto('/?demo=integration');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    const menuToggle = page.getByTestId('test-sui-studio-navbar-item-menu');
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();
    await expect(page.getByText('Go back')).toBeVisible();

    const fileMenuItem = page.getByText('File');
    await expect(fileMenuItem).toBeVisible();

    await fileMenuItem.click();
    await expect(page.getByText('Save project')).toBeVisible();
    await expect(page.getByText('Save as')).toBeVisible();
    await expect(page.getByText('Rename')).toBeVisible();
});

test('layouts ui translations', async ({ page }) => {
    const uiTranslations = {
        formBuilder: {
            layouts: {
                header: 'Layouts custom header',
                width: 'Width custom label',
                height: 'Height custom label',
            },
        },
    };
    const projectConfig = { ...getProjectConfig({ uiTranslations }) };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
    `);

    await page.goto('/?demo=integration');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    const layoutsHeading = page.getByTestId('test-sui-layouts-heading');
    await expect(layoutsHeading).toBeVisible();

    await expect(layoutsHeading).toMatchAriaSnapshot(`
        - heading "Layouts custom header"
        - text: Select layout
        `);

    const availableLayoutsSelect = layoutsHeading.locator('.grafx-select__control');
    await availableLayoutsSelect.click();
    await page.locator('.grafx-select__option', { hasText: 'A4' }).click();

    const layoutPropertiesInputs = page.getByTestId('test-sui-layout-properties-inputs');
    await expect(layoutPropertiesInputs).toBeVisible();
    await expect(layoutPropertiesInputs).toMatchAriaSnapshot(`
        - text: Width custom label
        - textbox "page-width-input":
            - /placeholder: Width custom label
            - text: 210 mm
        - text: Height custom label
        - textbox "page-height-input":
            - /placeholder: Height custom label
            - text: 297 mm
        `);
});

test('variables ui translations', async ({ page }) => {
    const uiTranslations = {
        formBuilder: {
            variables: {
                header: 'Variables custom header',
                helpText: 'Variables custom help text',
            },
        },
    };
    const projectConfig = { ...getProjectConfig({ uiTranslations }) };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
    `);

    await page.goto('/?demo=integration');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    const variablesHeading = page.getByTestId('test-sui-variables-heading');
    await expect(variablesHeading).toBeVisible();

    await expect(variablesHeading).toMatchAriaSnapshot(`
        - heading "Variables custom header"
        - paragraph: Variables custom help text
        `);
});

test('datasource ui translations', async ({ page }) => {
    const uiTranslations = {
        formBuilder: {
            datasource: {
                header: 'Datasource custom header',
                helpText: 'Datasource custom help text',
                row: 'Datasource custom row',
                inputLabel: 'Datasource custom input label',
            },
        },
    };
    const projectConfig = { ...getProjectConfig({ uiTranslations }) };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
    `);

    await page.goto('/?demo=integration');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    const datasourceHeading = page.getByTestId('test-sui-datasource-heading');
    await expect(datasourceHeading).toBeVisible();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await expect(page.getByTestId('test-gsc-scrollbar-wrapper')).toMatchAriaSnapshot(`
        - heading "Datasource custom header"
        - paragraph: Datasource custom help text
        - text: Datasource custom input label
        - textbox "data-source-input":
          - /placeholder: Select data row
          - text: /New Listing \\| 0b10af0f-\\d+-4e5e-a835-8642b23f3a28 \\| Charming house featuring 4 bedrooms, 3 bathrooms and a backyard \\| Beautiful property close to all amenities \\| 149c5d16-b1fa-4a44-a49d-f6bcd652515d \\| Janice Barrow \\| Real Estate Broker \\| \\d+-\\d+-\\d+ \\| chill\\.com\\/properties/
        - button [disabled]
        - text: Datasource custom row 1
        - button
        `);
});

import { test, expect } from '@playwright/test';
import { getProjectConfig } from '../helpers/project.config';
test('focus and blur a text variable', async ({ page }) => {
    const projectConfig = { ...getProjectConfig({}) };

    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
        window.__VARIABLE_FOCUSED__ID__ = null;
        window.__VARIABLE_BLURRED__ID__ = null;
        window.__PROJECT_CONFIG__.onVariableFocus = (id) => {
            window.__VARIABLE_FOCUSED__ID__ = id;
        };
        window.__PROJECT_CONFIG__.onVariableBlur = (id) => {
            window.__VARIABLE_BLURRED__ID__ = id;
        };
    `);

    await page.goto('/?demo=integration');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    let variableFocused = await page.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);

    expect(variableFocused).toBe(null);
    const textVariable = page.locator('input[value="New Listing"]');
    await expect(textVariable).toBeVisible();
    await textVariable.fill('variable value');

    variableFocused = await page.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
    expect(variableFocused).toBe('a754b513-c120-4a0d-9f3c-96ebc825cba4');

    const dataSourceTitle = page.getByRole('heading', { name: 'Data source' });
    await expect(dataSourceTitle).toBeVisible();
    await dataSourceTitle.click();

    const variableBlurred = await page.evaluate(() => (window as any).__VARIABLE_BLURRED__ID__);
    expect(variableBlurred).toBe('a754b513-c120-4a0d-9f3c-96ebc825cba4');
});

test('focus an image variable on browse', async ({ page }) => {
    const projectConfig = { ...getProjectConfig({}) };

    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
        window.__VARIABLE_FOCUSED__ID__ = null;
        window.__PROJECT_CONFIG__.onVariableFocus = (id) => {
            window.__VARIABLE_FOCUSED__ID__ = id;
        };
    `);

    await page.goto('/?demo=integration');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    let variableFocused = await page.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
    expect(variableFocused).toBe(null);

    await expect(page.getByTestId('test-gsc-scrollbar-wrapper')).toMatchAriaSnapshot(`
        - text: Data row
        - textbox "data-source-input":
          - /placeholder: Select data row
          - text: /New Listing \\| 0b10af0f-\\d+-4e5e-a835-8642b23f3a28 \\| Charming house featuring 4 bedrooms, 3 bathrooms and a backyard \\| Beautiful property close to all amenities \\| 149c5d16-b1fa-4a44-a49d-f6bcd652515d \\| Janice Barrow \\| Real Estate Broker \\| \\d+-\\d+-\\d+ \\| chill\\.com\\/properties/
        - button
        `);

    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });

    const imageVariable = page.getByTestId('test-gsc-image-picker-content').first();
    await expect(imageVariable).toBeVisible();
    await imageVariable.dblclick();

    await expect(page.getByPlaceholder('Search')).toBeVisible();
    variableFocused = await page.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
    expect(variableFocused).toBe('65aa0424-ff1d-4939-8ad3-37ba84463953');
});

test('focus and blur an image variable on remove', async ({ page }) => {
    const projectConfig = { ...getProjectConfig({}) };

    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
        window.__VARIABLE_FOCUSED__ID__ = null;
        window.__VARIABLE_BLURRED__ID__ = null;
        window.__PROJECT_CONFIG__.onVariableFocus = (id) => {
            window.__VARIABLE_FOCUSED__ID__ = id;
        };
        window.__PROJECT_CONFIG__.onVariableBlur = (id) => {
            window.__VARIABLE_BLURRED__ID__ = id;
        };
    `);
    await page.goto('/?demo=integration');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    let variableFocused = await page.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
    let variableBlurred = await page.evaluate(() => (window as any).__VARIABLE_BLURRED__ID__);
    expect(variableFocused).toBe(null);
    expect(variableBlurred).toBe(null);

    await expect(page.getByTestId('test-gsc-scrollbar-wrapper')).toMatchAriaSnapshot(`
        - text: Data row
        - textbox "data-source-input":
          - /placeholder: Select data row
          - text: /New Listing \\| 0b10af0f-\\d+-4e5e-a835-8642b23f3a28 \\| Charming house featuring 4 bedrooms, 3 bathrooms and a backyard \\| Beautiful property close to all amenities \\| 149c5d16-b1fa-4a44-a49d-f6bcd652515d \\| Janice Barrow \\| Real Estate Broker \\| \\d+-\\d+-\\d+ \\| chill\\.com\\/properties/
        - button
        `);

    const imageVariable = page.locator('#b0baa83c-6ce3-441f-a39f-0b767b5bc329');
    await expect(imageVariable).toBeVisible();

    const removeButton = page
        .getByTestId('test-sui-img-picker-b0baa83c-6ce3-441f-a39f-0b767b5bc329')
        .getByTestId('test-gsc-button');
    await expect(removeButton).toBeVisible();
    await removeButton.click();

    variableFocused = await page.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
    expect(variableFocused).toBe('b0baa83c-6ce3-441f-a39f-0b767b5bc329');
    variableBlurred = await page.evaluate(() => (window as any).__VARIABLE_BLURRED__ID__);
    expect(variableBlurred).toBe('b0baa83c-6ce3-441f-a39f-0b767b5bc329');
});

test('focus and blur on image upload', async ({ page }) => {
    const projectConfig = { ...getProjectConfig({}) };

    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
        window.__VARIABLE_FOCUSED__ID__ = null;
        window.__VARIABLE_BLURRED__ID__ = null;
        window.__PROJECT_CONFIG__.onVariableFocus = (id) => {
            window.__VARIABLE_FOCUSED__ID__ = id;
        };
        window.__PROJECT_CONFIG__.onVariableBlur = (id) => {
            window.__VARIABLE_BLURRED__ID__ = id;
        };
    `);
    await page.goto('/?demo=integration');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    let variableFocused = await page.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
    let variableBlurred = await page.evaluate(() => (window as any).__VARIABLE_BLURRED__ID__);
    expect(variableFocused).toBe(null);
    expect(variableBlurred).toBe(null);

    await expect(page.getByTestId('test-gsc-scrollbar-wrapper')).toMatchAriaSnapshot(`
        - text: Data row
        - textbox "data-source-input":
          - /placeholder: Select data row
          - text: /New Listing \\| 0b10af0f-\\d+-4e5e-a835-8642b23f3a28 \\| Charming house featuring 4 bedrooms, 3 bathrooms and a backyard \\| Beautiful property close to all amenities \\| 149c5d16-b1fa-4a44-a49d-f6bcd652515d \\| Janice Barrow \\| Real Estate Broker \\| \\d+-\\d+-\\d+ \\| chill\\.com\\/properties/
        - button
        `);

    const imageVariable = page.locator('#b0baa83c-6ce3-441f-a39f-0b767b5bc329');
    await expect(imageVariable).toBeVisible();

    const filePath = new URL('assets/img.PNG', import.meta.url).pathname;
    const uploadInput = page
        .getByTestId('test-sui-img-picker-b0baa83c-6ce3-441f-a39f-0b767b5bc329')
        .getByTestId('test-gsc-image-picker-upload-input');
    uploadInput.setInputFiles(filePath);
    await uploadInput.dispatchEvent('change');

    variableFocused = await page.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
    expect(variableFocused).toBe('b0baa83c-6ce3-441f-a39f-0b767b5bc329');
    variableBlurred = await page.evaluate(() => (window as any).__VARIABLE_BLURRED__ID__);
    expect(variableBlurred).toBe('b0baa83c-6ce3-441f-a39f-0b767b5bc329');
});

import { Page } from '@playwright/test';
import { test as base, expect } from '@helpers';

const initScript = `
            window.__VARIABLE_FOCUSED__ID__ = null;
            window.__VARIABLE_BLURRED__ID__ = null;
            window.__PROJECT_CONFIG__.onVariableFocus = (id) => {
                window.__VARIABLE_FOCUSED__ID__ = id;
            };
            window.__PROJECT_CONFIG__.onVariableBlur = (id) => {
                window.__VARIABLE_BLURRED__ID__ = id;
            };
        `;
const test = base.extend<{ variableEventsPage: Page }>({
    variableEventsPage: async ({ page }, use) => {
        await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();
        await use(page);
    },
});

test.describe('variable events', () => {
    test.use({ initScript });

    test('focus and blur a text variable', async ({ variableEventsPage }) => {
        let variableFocused = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);

        expect(variableFocused).toBe(null);
        const textVariable = variableEventsPage.locator('input[value="New Listing"]');
        await expect(textVariable).toBeVisible();
        // did not use fill to avoid triggering blur event when typing
        await textVariable.click();
        await textVariable.pressSequentially('variable value');

        let variableBlurred = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_BLURRED__ID__);
        variableFocused = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
        expect(variableFocused).toBe('a754b513-c120-4a0d-9f3c-96ebc825cba4');
        expect(variableBlurred).toBe(null);

        // trigger blur event by clicking on any other element
        const dataSourceTitle = variableEventsPage.getByRole('heading', { name: 'Data source' });
        await expect(dataSourceTitle).toBeVisible();
        await dataSourceTitle.click();

        variableBlurred = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_BLURRED__ID__);
        expect(variableBlurred).toBe('a754b513-c120-4a0d-9f3c-96ebc825cba4');
    });

    test('focus and blur a number variable', async ({ variableEventsPage }) => {
        let variableFocused = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
        expect(variableFocused).toBe(null);

        const numberVariable = variableEventsPage.getByTestId(
            'test-sui-input-number-cfdb290c-2f69-4e53-b432-dc41401c0c07',
        );
        await expect(numberVariable).toBeVisible();
        await numberVariable.click();

        variableFocused = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
        let variableBlurred = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_BLURRED__ID__);
        expect(variableFocused).toBe('cfdb290c-2f69-4e53-b432-dc41401c0c07');
        expect(variableBlurred).toBe(null);

        await variableEventsPage.waitForTimeout(2000);

        await expect(variableEventsPage.getByTestId('test-gsc-scrollbar-wrapper')).toMatchAriaSnapshot(`
        - text: Data row
        - textbox "data-source-input":
          - /placeholder: Select data row
          - text: /New Listing \\| 0b10af0f-\\d+-4e5e-a835-8642b23f3a28 \\| Charming house featuring 4 bedrooms, 3 bathrooms and a backyard \\| Beautiful property close to all amenities \\| 149c5d16-b1fa-4a44-a49d-f6bcd652515d \\| Janice Barrow \\| Real Estate Broker \\| \\d+-\\d+-\\d+ \\| chill\\.com\\/properties/
        - button
        `);

        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });

        const imageVariable = variableEventsPage.getByTestId('test-gsc-image-picker-content').first();
        await expect(imageVariable).toBeVisible();
        await imageVariable.dblclick();

        await expect(variableEventsPage.getByPlaceholder('Search')).toBeVisible();
        variableFocused = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
        expect(variableFocused).toBe('65aa0424-ff1d-4939-8ad3-37ba84463953');
    });

    test('focus and blur an image variable on remove', async ({ variableEventsPage }) => {
        let variableFocused = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
        let variableBlurred = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_BLURRED__ID__);
        expect(variableFocused).toBe(null);
        expect(variableBlurred).toBe(null);

        await expect(variableEventsPage.getByTestId('test-gsc-scrollbar-wrapper')).toMatchAriaSnapshot(`
        - text: Data row
        - textbox "data-source-input":
          - /placeholder: Select data row
          - text: /New Listing \\| 0b10af0f-\\d+-4e5e-a835-8642b23f3a28 \\| Charming house featuring 4 bedrooms, 3 bathrooms and a backyard \\| Beautiful property close to all amenities \\| 149c5d16-b1fa-4a44-a49d-f6bcd652515d \\| Janice Barrow \\| Real Estate Broker \\| \\d+-\\d+-\\d+ \\| chill\\.com\\/properties/
        - button
        `);

        const imageVariable = variableEventsPage.locator('#b0baa83c-6ce3-441f-a39f-0b767b5bc329');
        await expect(imageVariable).toBeVisible();

        const removeButton = variableEventsPage
            .getByTestId('test-sui-img-picker-b0baa83c-6ce3-441f-a39f-0b767b5bc329')
            .getByTestId('test-gsc-button');
        await expect(removeButton).toBeVisible();
        await removeButton.click();

        variableFocused = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
        expect(variableFocused).toBe('b0baa83c-6ce3-441f-a39f-0b767b5bc329');
        variableBlurred = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_BLURRED__ID__);
        expect(variableBlurred).toBe('b0baa83c-6ce3-441f-a39f-0b767b5bc329');
    });

    test.skip('focus and blur on image upload', async ({ variableEventsPage }) => {
        let variableFocused = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
        let variableBlurred = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_BLURRED__ID__);
        expect(variableFocused).toBe(null);
        expect(variableBlurred).toBe(null);

        await expect(variableEventsPage.getByTestId('test-gsc-scrollbar-wrapper')).toMatchAriaSnapshot(`
        - text: Data row
        - textbox "data-source-input":
          - /placeholder: Select data row
          - text: /New Listing \\| 0b10af0f-\\d+-4e5e-a835-8642b23f3a28 \\| Charming house featuring 4 bedrooms, 3 bathrooms and a backyard \\| Beautiful property close to all amenities \\| 149c5d16-b1fa-4a44-a49d-f6bcd652515d \\| Janice Barrow \\| Real Estate Broker \\| \\d+-\\d+-\\d+ \\| chill\\.com\\/properties/
        - button
        `);

        const imageVariable = variableEventsPage.locator('#b0baa83c-6ce3-441f-a39f-0b767b5bc329');
        await expect(imageVariable).toBeVisible();

        const filePath = new URL('assets/img.PNG', import.meta.url).pathname;
        const uploadInput = variableEventsPage
            .getByTestId('test-sui-img-picker-b0baa83c-6ce3-441f-a39f-0b767b5bc329')
            .getByTestId('test-gsc-image-picker-upload-input');
        uploadInput.setInputFiles(filePath);
        await uploadInput.dispatchEvent('change');

        variableFocused = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_FOCUSED__ID__);
        expect(variableFocused).toBe('b0baa83c-6ce3-441f-a39f-0b767b5bc329');
        variableBlurred = await variableEventsPage.evaluate(() => (window as any).__VARIABLE_BLURRED__ID__);
        expect(variableBlurred).toBe('b0baa83c-6ce3-441f-a39f-0b767b5bc329');
        //  remove the asset afterwards
    });
});

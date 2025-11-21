// eslint-disable-next-line import/no-extraneous-dependencies
import { test, expect } from '@playwright/test';
import { UiOptions } from 'src/types/types';
import { getProjectConfig } from '../helpers/project.config';

const uiOptions: UiOptions = {
    theme: {
        fontFamily: 'inherit',
        colors: {
            brandBackgroundColor: '#F40009', // Used for primary buttons, checkboxes, toggles, radio buttons, animation timeline, etc.
            primaryButtonTextColor: '#ffffff', // Used for primary button text, checkboxes, toggles, radio buttons.
            primaryButtonHoverColor: '#CB0007', // Used for primary button hover background.
            panelBackgroundColor: '#252525', // Used for panel and modal backgrounds.
            dropdownMenuBackgroundColor: '#2F2F2F', // Used for dropdown menu backgrounds.
            inputBackgroundColor: '#323232', // Used for input fields background.
            inputBorderColor: '#F5F5F5', // Used for the border color of input fields.
            inputFocusBorderColor: '#ffffff', // Used for the border color of input fields when focused.
            canvasBackgroundColor: '#161616', // Used for canvas background.
            highlightedElementsColor: '#3E3E3E', // Used for highlighted elements.
            disabledElementsColor: '#6E6E6E', // Used for disabled text and buttons.
            placeholderTextColor: '#909090', // Used for text placeholders.
            primaryTextColor: '#ffffff', // Used for primary text.
            secondaryTextColor: '#B9B9B9', // Used for secondary text.
        },
    },
    widgets: {
        downloadButton: {
            visible: true,
        },
        backButton: {
            visible: true,
        },
    },
};

test('ui theme options', async ({ page }) => {
    const projectConfig = { ...getProjectConfig({ uiOptions }) };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
    `);

    await page.goto('/?demo=integration');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    // Inject the comic sans font style after navigation
    await page.addStyleTag({
        content: 'body { font-family: Comic Sans MS, cursive, sans-serif; }',
    });

    await expect(page.getByLabel('Project: Listing')).toBeVisible();

    // check if the comic sans font is injected on the body
    await expect(page.locator('body')).toHaveCSS('font-family', '"Comic Sans MS", cursive, sans-serif');
    // check if comic sans font is used in the UI
    await expect(page.getByLabel('Project: Listing')).toHaveCSS('font-family', '"Comic Sans MS", cursive, sans-serif');
    // background color of the button should be #F40009 = rgb(244, 0, 9)
    await expect(page.getByTestId('test-sui-navbar-item-download').getByTestId('test-gsc-button')).toHaveCSS(
        'background-color',
        'rgb(244, 0, 9)',
    );
    // primaryButtonTextColor should be #ffffff
    await expect(page.getByLabel('Download').getByTestId('test-gsc-button')).toHaveCSS('color', 'rgb(255, 255, 255)');
    // primaryButtonHoverColor should be #CB0007 = rgb(203, 0, 7) on hover
    const downloadButton = page.getByLabel('Download').getByTestId('test-gsc-button');
    await downloadButton.hover();
    await expect(downloadButton).toHaveCSS('background-color', 'rgb(203, 0, 7)');

    // panelBackgroundColor should be #252525 = rgb(37, 37, 37)
    await expect(page.getByTestId('test-sui-left-panel')).toHaveCSS('background-color', 'rgb(37, 37, 37)');
    // dropdownMenuBackgroundColor is difficult to test because it's inside a dropdown menu, so we skip it for now
    // inputBackgroundColor should be #323232 = rgb(50, 50, 50)
    await expect(page.locator('.grafx-select__control').first()).toHaveCSS('background-color', 'rgb(50, 50, 50)');
    // inputBorderColor should be #F5F5F5 = rgb(245, 245, 245)
    await expect(page.locator('.grafx-select__control').first()).toHaveCSS('border-color', 'rgb(245, 245, 245)');
    // inputFocusBorderColor should be #ffffff = rgb(255, 255, 255)
    await expect(page.locator('.grafx-select__control').first()).toBeVisible();
    await page.locator('.grafx-select__control').first().click();
    await expect(page.locator('.grafx-select__control').first()).toHaveCSS('border-color', 'rgb(255, 255, 255)');
    // canvasBackgroundColor should be #161616 = rgb(22, 22, 22)
    // tested in unit tests
    // highlightedElementsColor should be #3E3E3E = rgb(62, 62, 62)
    await expect(page.getByRole('option').first()).toHaveCSS('background-color', 'rgb(62, 62, 62)');
    // disabledElementsColor should be #6E6E6E = rgb(110, 110, 110)
    // tested in unit tests
    // placeholderTextColor should be #909090 = rgb(144, 144, 144)
    page.getByLabel('Project: Listing').click();
    // wait for 1 second
    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });

    await page.getByTestId('test-sui-input-a754b513-c120-4a0d-9f3c-96ebc825cba4').dblclick();
    await page.getByTestId('test-sui-input-a754b513-c120-4a0d-9f3c-96ebc825cba4').fill('');
    // Check placeholder pseudo-element CSS color
    const inputElement = page.getByTestId('test-sui-input-a754b513-c120-4a0d-9f3c-96ebc825cba4');
    const placeholderColor = await inputElement.evaluate((element) => {
        return window.getComputedStyle(element, '::placeholder').color;
    });
    expect(placeholderColor).toBe('rgb(144, 144, 144)');
    // primaryTextColor should be #ffffff = rgb(255, 255, 255)
    await expect(page.getByRole('heading', { name: 'Data source' })).toHaveCSS('color', 'rgb(255, 255, 255)');

    // secondaryTextColor should be #B9B9B9 = rgb(185, 185, 185)
    await expect(page.getByLabel('Project: Listing')).toHaveCSS('color', 'rgb(185, 185, 185)');
});

test('dark ui theme', async ({ page }) => {
    const projectConfig = {
        ...getProjectConfig({
            uiOptions: {
                uiTheme: 'dark',
                widgets: {
                    downloadButton: {
                        visible: true,
                    },
                },
            },
        }),
    };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
    `);

    await page.goto('/?demo=integration');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    const availableLayoutsInput = page.locator('#sui-dropdown-available-layout-label-with-icon-container');
    await expect(availableLayoutsInput).toBeVisible();

    const availableLayoutsSelect = page.locator('.grafx-select__control').nth(0);
    await availableLayoutsSelect.click();
    await page.locator('.grafx-select__option', { hasText: '2K' }).click();

    await expect(page.getByTestId('test-sui-left-panel')).toHaveCSS('background-color', 'rgb(37, 37, 37)');
    await expect(page.getByTestId('test-sui-navbar')).toHaveCSS('background-color', 'rgb(37, 37, 37)');
    await expect(page.getByTestId('test-sui-timeline-wrapper')).toHaveCSS('background-color', 'rgb(37, 37, 37)');

    await expect(page.getByRole('heading', { name: 'Data source' })).toHaveCSS('color', 'rgb(255, 255, 255)');

    await expect(page.getByTestId('test-sui-navbar-item-download').getByTestId('test-gsc-button')).toHaveCSS(
        'background-color',
        'rgb(79, 205, 182)',
    );

    await expect(page.locator('.grafx-select__control').first()).toHaveCSS('background-color', 'rgb(50, 50, 50)');

    await expect(page.locator('input[value="New Listing"] >> xpath=..')).toHaveCSS(
        'background-color',
        'rgb(50, 50, 50)',
    );
    await expect(page.locator('input[value="New Listing"]')).toHaveCSS('color', 'rgb(255, 255, 255)');

    const leftPanelScrollbarThumb = page.getByTestId('test-gsc-scrollbar-wrapper');
    const thumbColor = await leftPanelScrollbarThumb.evaluate((element) => {
        return window.getComputedStyle(element, '::-webkit-scrollbar-thumb').backgroundColor;
    });
    expect(thumbColor).toBe('rgb(62, 62, 62)');
});

test('light ui theme', async ({ page }) => {
    const projectConfig = {
        ...getProjectConfig({
            uiOptions: {
                uiTheme: 'light',
                widgets: {
                    downloadButton: {
                        visible: true,
                    },
                },
            },
        }),
    };
    const configString = JSON.stringify(projectConfig);

    await page.addInitScript(`
        window.__PROJECT_CONFIG__ = ${configString};
    `);

    await page.goto('/?demo=integration');

    await expect(page.locator('#studio-ui-chili-editor').first()).toBeVisible();

    const availableLayoutsInput = page.locator('#sui-dropdown-available-layout-label-with-icon-container');
    await expect(availableLayoutsInput).toBeVisible();

    const availableLayoutsSelect = page.locator('.grafx-select__control').nth(0);
    await availableLayoutsSelect.click();
    await page.locator('.grafx-select__option', { hasText: '2K' }).click();

    await expect(page.getByTestId('test-sui-left-panel')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.getByTestId('test-sui-navbar')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.getByTestId('test-sui-timeline-wrapper')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.getByTestId('test-sui-navbar-item-download').getByTestId('test-gsc-button')).toHaveCSS(
        'background-color',
        'rgb(1, 0, 88)',
    );
    await expect(page.getByRole('heading', { name: 'Data source' })).toHaveCSS('color', 'rgb(44, 44, 44)');

    await expect(page.locator('.grafx-select__control').first()).toHaveCSS('background-color', 'rgb(245, 245, 245)');

    await expect(page.locator('input[value="New Listing"] >> xpath=..')).toHaveCSS(
        'background-color',
        'rgb(245, 245, 245)',
    );
    await expect(page.locator('input[value="New Listing"]')).toHaveCSS('color', 'rgb(44, 44, 44)');

    const leftPanelScrollbarThumb = page.getByTestId('test-gsc-scrollbar-wrapper');
    const thumbColor = await leftPanelScrollbarThumb.evaluate((element) => {
        return window.getComputedStyle(element, '::-webkit-scrollbar-thumb').backgroundColor;
    });
    expect(thumbColor).toBe('rgb(142, 142, 142)');
});

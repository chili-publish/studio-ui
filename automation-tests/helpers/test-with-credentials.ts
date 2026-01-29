import { test as base } from '@playwright/test';

/**
 * Custom Playwright test fixture that automatically injects integration credentials
 * into all pages. This allows credentials from GitHub secrets (CI) or .env.local (local)
 * to be available in the browser context.
 *
 * Usage: Import this instead of '@playwright/test' in test files:
 *   import { test, expect } from '../helpers/test-with-credentials';
 */
export const test = base.extend({
    page: async ({ page }, use) => {
        const clientId = process.env.INTEGRATION_CLIENT_ID;
        const clientSecret = process.env.INTEGRATION_CLIENT_SECRET;
        if (clientId && clientSecret) {
            await page.addInitScript(`
                window.__INTEGRATION_CLIENT_ID = '${clientId}';
                window.__INTEGRATION_CLIENT_SECRET = '${clientSecret}';
            `);
        }

        await use(page);
    },
});

export { expect } from '@playwright/test';

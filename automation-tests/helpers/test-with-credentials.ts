import { test as base } from '@playwright/test';
import { getProjectConfig } from './project.config';

/**
 * Custom Playwright test fixture that automatically injects integration credentials
 * into all pages. This allows credentials from GitHub secrets (CI) or .env.local (local)
 * to be available in the browser context.
 *
 * Usage: Import this instead of '@playwright/test' in test files:
 *   import { test, expect } from '../helpers/test-with-credentials';
 */

type Fixtures = {
    initScript?: string;
    projectConfig?: any;
};

export const test = base.extend<Fixtures>({
    // Optional per-test init script and project config
    initScript: [undefined, { option: true }],
    projectConfig: [{ ...getProjectConfig({}) }, { option: true }],

    page: async ({ page, initScript, projectConfig }, use) => {
        const configString = JSON.stringify(projectConfig);
        const clientId = process.env.INTEGRATION_CLIENT_ID;
        const clientSecret = process.env.INTEGRATION_CLIENT_SECRET;
        if (clientId && clientSecret) {
            await page.addInitScript(`
                window.__INTEGRATION_CLIENT_ID = '${clientId}';
                window.__INTEGRATION_CLIENT_SECRET = '${clientSecret}';
            `);
        }
        await page.addInitScript(`window.__PROJECT_CONFIG__ = ${configString};`);
        if (initScript) {
            await page.addInitScript(initScript);
        }
        await page.goto('');
        await page.waitForLoadState('networkidle');
        await use(page);
    },
});

export { expect } from '@playwright/test';

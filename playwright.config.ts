import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

// Determine baseURL and webServer config based on environment
function getTestConfig() {
    // Check if running in CI
    if (process.env.CI) {
        const testPort = 3003;
        // In CI, serve the built bundle locally instead of navigating to platform URL
        const baseURL = `http://localhost:${testPort}`;
        let testUrl = `${baseURL}?demo=integration`;

        return {
            baseURL: testUrl,
            webServer: {
                command: 'yarn build && yarn preview --port ' + testPort,
                port: testPort,
                reuseExistingServer: false,
                timeout: 300000, // 5 minutes for build + server start
            },
        };
    }

    // Local development - use vite dev server
    let url = `http://localhost:3002?demo=integration`;

    return {
        baseURL: url,
        webServer: {
            command: 'yarn dev',
            port: 3002,
            reuseExistingServer: true,
            timeout: 120000,
        },
    };
}

const testConfig = getTestConfig();

export default defineConfig({
    testDir: './automation-tests/integrationLayer',
    use: {
        baseURL: testConfig.baseURL,
        trace: 'on',
    },
    webServer: testConfig.webServer,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['html']],
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
        // Mobile tests
        {
            name: 'mobile',
            use: {
                ...devices['iPhone 12 Mini'],
                browserName: 'chromium',
            },
            testDir: './automation-tests/integrationLayer/mobile',
        },
    ],
});

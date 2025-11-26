import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });
export default defineConfig({
    testDir: './automation-tests/integrationLayer',
    use: {
        baseURL: 'http://localhost:3002',
    },
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

import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });
export default defineConfig({
    testDir: './automation-tests/integrationLayer',
    use: {
        baseURL: 'http://localhost:3002',
    },
});

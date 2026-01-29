import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { projectInfo } from './automation-tests/helpers/projectInfo';
dotenv.config({ path: '../.env.local' });

// Determine baseURL based on environment
function getBaseURL(): string {
    const { envId, projectId } = projectInfo;
    // Check if running in CI
    if (process.env.CI) {
        // Try to get PR number from various sources
        let githubPrNumber: string | undefined = process.env.GITHUB_PR_NUMBER;

        console.log('githubPrNumber', githubPrNumber);
        if (githubPrNumber) {
            console.log(
                'baseUrl',
                `https://chiligrafx-main.com/environments/${envId}/studio/projects/${projectId}?studio-ui=pr_builds/${githubPrNumber}`,
            );
            return `https://chiligrafx-main.com/environments/${envId}/studio/projects/${projectId}?studio-ui=pr_builds/${githubPrNumber}`;
        }

        // If we're in CI but can't determine PR number, throw an error
        throw new Error(
            'Running in CI but could not determine github pr number. Please set GITHUB_PR_NUMBER environment variable.',
        );
    }

    // Local development
    return 'http://localhost:3002';
}

export default defineConfig({
    testDir: './automation-tests/integrationLayer',
    use: {
        baseURL: getBaseURL(),
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

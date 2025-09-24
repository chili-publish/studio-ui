/**
 * Service for making HTTP requests to project data endpoints with optional authentication
 */
export class ProjectDataClient {
    private graFxStudioEnvironmentApiBaseUrl: string;

    private getAuthToken: () => string;

    constructor(graFxStudioEnvironmentApiBaseUrl: string, getAuthToken: () => string) {
        this.graFxStudioEnvironmentApiBaseUrl = graFxStudioEnvironmentApiBaseUrl;
        this.getAuthToken = getAuthToken;
    }

    /**
     * Makes a GET request to a URL with optional authentication
     * @param url - The URL to fetch from
     * @returns Promise<string | null> - The response data or null on error
     */
    async fetchFromUrl(url: string): Promise<string | null> {
        try {
            const headers = this.getAuthHeaders(url);
            const response = await fetch(url, { headers });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return JSON.stringify(data.data);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Failed to fetch from ${url}:`, error);
            return null;
        }
    }

    /**
     * Makes a PUT request to a URL with optional authentication
     * @param url - The URL to save to
     * @param data - The data to send
     * @returns Promise<void> - Success status
     */
    async saveToUrl(url: string, data: string): Promise<void> {
        const headers = {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(url),
        };

        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: data,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    }

    /**
     * Checks if a URL is internal (requires authentication)
     * @param url - The URL to check
     * @returns boolean
     */
    isInternalUrl(url: string): boolean {
        return url.startsWith(this.graFxStudioEnvironmentApiBaseUrl);
    }

    /**
     * Gets authentication headers for internal URLs
     * @param url - The URL to get headers for
     * @returns Record<string, string> | undefined
     */
    private getAuthHeaders(url: string): Record<string, string> | undefined {
        if (this.isInternalUrl(url)) {
            return { Authorization: `Bearer ${this.getAuthToken()}` };
        }
        return undefined;
    }
}

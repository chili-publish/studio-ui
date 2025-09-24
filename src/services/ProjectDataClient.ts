import { ContentType, contentTypeToExtension } from 'src/utils/contentType';

/**
 * Service for making HTTP requests to project data endpoints with authentication
 */
export class ProjectDataClient {
    private getAuthToken: () => string;

    constructor(getAuthToken: () => string) {
        this.getAuthToken = getAuthToken;
    }

    /**
     * Makes a GET request to a URL with authentication
     * @param url - The URL to fetch from
     * @returns Promise<string | null> - The response data or null on error
     */
    async fetchFromUrl(url: string): Promise<string | null> {
        try {
            const headers = this.getAuthHeaders();
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
     * Makes a PUT request to a URL with authentication
     * @param url - The URL to save to
     * @param data - The data to send
     * @returns Promise<void> - Success status
     */
    async saveToUrl(url: string, data: string): Promise<void> {
        const headers = {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
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

    async downloadFromUrl(url: string) {
        const headers = this.getAuthHeaders();
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') as ContentType;
        return {
            extensionType: contentTypeToExtension(contentType),
            outputData: await response.blob(),
        };
    }

    /**
     * Gets authentication headers for all requests
     * @returns Record<string, string>
     */
    private getAuthHeaders(): Record<string, string> {
        return { Authorization: `Bearer ${this.getAuthToken()}` };
    }
}

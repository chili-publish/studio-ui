import { ContentType, contentTypeToExtension } from 'src/utils/contentType';
import { TokenService } from './TokenService';

/**
 * Service for making HTTP requests to project data endpoints with authentication
 */
export class ProjectDataClient {
    /**
     * Makes a GET request to a URL with authentication
     * @param url - The URL to fetch from
     * @returns Promise<string | null> - The response data or null on error
     */
    async fetchFromUrl(url: string): Promise<string | null> {
        try {
            const response = await this.makeAuthenticatedRequest(url, 'GET');
            const data = await response.json();
            return JSON.stringify(data);
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
        await this.makeAuthenticatedRequest(url, 'PUT', data);
    }

    async downloadFromUrl(url: string) {
        const response = await this.makeAuthenticatedRequest(url, 'GET');
        const contentType = response.headers.get('content-type') as ContentType;
        return {
            extensionType: contentTypeToExtension(contentType),
            outputData: await response.blob(),
        };
    }

    /**
     * Makes an authenticated request with automatic token refresh on 401
     */
    private async makeAuthenticatedRequest(url: string, method: string, body?: string): Promise<Response> {
        const headers = this.getAuthHeaders();
        if (body) {
            headers['Content-Type'] = 'application/json';
        }

        let response = await fetch(url, { method, headers, body });

        // Handle 401 with token refresh and retry
        if (response.status === 401) {
            await TokenService.getInstance().refreshToken();
            response = await fetch(url, { method, headers: this.getAuthHeaders(), body });
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    }

    /**
     * Gets authentication headers for all requests
     * @returns Record<string, string>
     */
    // eslint-disable-next-line class-methods-use-this
    private getAuthHeaders(): Record<string, string> {
        return { Authorization: `Bearer ${TokenService.getInstance().getToken()}` };
    }
}

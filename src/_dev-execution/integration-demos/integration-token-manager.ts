/* eslint-disable no-underscore-dangle */
export class IntegrationTokenManager {
    private readonly client_id: string;

    private readonly client_secret: string;

    constructor() {
        this.client_id = window.__INTEGRATION_CLIENT_ID ?? import.meta.env.VITE_INTEGRATION_CLIENT_ID ?? '';
        this.client_secret = window.__INTEGRATION_CLIENT_SECRET ?? import.meta.env.VITE_INTEGRATION_CLIENT_SECRET ?? '';
    }

    async getAccessToken(): Promise<string> {
        try {
            const response = await fetch('https://integration-login.chiligrafx-main.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'client_credentials',
                    audience: 'https://chiligrafx.com',
                    client_id: this.client_id,
                    client_secret: this.client_secret,
                }),
            });
            const data = await response.json();
            if (!data.access_token) {
                throw new Error('Failed to get access token');
            }
            return data.access_token;
        } catch {
            throw new Error('Failed to get access token');
        }
    }
}

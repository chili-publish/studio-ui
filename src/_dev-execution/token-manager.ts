import { Auth0Client } from '@auth0/auth0-spa-js';

export class TokenManager {
    private auth0Client: Auth0Client;

    constructor() {
        // TODO: Read value from .env for all fields beside redirect_uri
        this.auth0Client = new Auth0Client({
            domain: `${import.meta.env.VITE_AUTH0_DOMAIN}`,
            clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
            useRefreshTokens: true,
            authorizationParams: {
                redirect_uri: window.location.origin,
                audience: import.meta.env.VITE_AUTH_AUTH0_AUDIENCE,
                scope: import.meta.env.VITE_AUTH_AUTH0_SCOPE,
            },
        });
    }

    async getAccessToken() {
        try {
            const authToken = await this.auth0Client.getTokenSilently();
            return authToken;
        } catch (e: any) {
            if (e.error !== 'login_required') {
                this.loginWithRedirect();
            }
            throw e;
        }
    }

    // eslint-disable-next-line class-methods-use-this
    async validateToken(token: string) {
        const { exp: expirationTime } = TokenManager.getJwtPayload(token);
        // expirationTime in seconds, Date.now() in ms
        return Date.now() < expirationTime * 1000;
    }

    async refreshToken() {
        try {
            const token = await this.auth0Client.getTokenSilently();
            return token;
        } catch (e: any) {
            if (e.error === 'invalid_grant') {
                this.loginWithRedirect();
            }
            throw e;
        }
    }

    async redirectCallback() {
        return this.auth0Client.handleRedirectCallback();
    }

    private loginWithRedirect() {
        this.auth0Client.loginWithRedirect({
            appState: {
                returnTo: window.location.href,
            },
        });
    }

    private static getJwtPayload(token: string): { exp: number } {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                window
                    .atob(base64)
                    .split('')
                    .map((c) => {
                        // eslint-disable-next-line prefer-template
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join(''),
            );

            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Invalid token format. Expects JWT');
        }
    }
}

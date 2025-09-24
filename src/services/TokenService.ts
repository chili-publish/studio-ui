import { AxiosError } from 'axios';

/**
 * Service responsible for managing authentication tokens
 * Handles token storage, retrieval, and refresh operations
 */
export class TokenService {
    private currentToken: string;

    private refreshTokenAction?: () => Promise<string | AxiosError>;

    constructor(authToken: string, refreshTokenAction?: () => Promise<string | AxiosError>) {
        this.currentToken = authToken;
        this.refreshTokenAction = refreshTokenAction;
    }

    /**
     * Get the current token
     */
    getToken(): string {
        return this.currentToken;
    }

    /**
     * Refresh the authentication token
     */
    async refreshToken(): Promise<string> {
        if (!this.refreshTokenAction) {
            throw new Error('The authentication token has expired, and a method to obtain a new one is not provided.');
        }

        const result = await this.refreshTokenAction();
        if (result instanceof Error) {
            throw result;
        }

        // Update the current token
        this.currentToken = result;
        return result;
    }
}

import { WellKnownConfigurationKeys } from '@chili-publish/studio-sdk';

/**
 * Service responsible for managing authentication tokens
 * Handles token storage, retrieval, and refresh operations
 * Singleton pattern ensures single source of truth for authentication
 */
export class TokenService {
    private static instance: TokenService | null = null;

    private currentToken: string;

    private refreshTokenAction?: () => Promise<string | Error>;

    private constructor(getTokenAction: () => string, refreshTokenAction?: () => Promise<string | Error>) {
        this.currentToken = getTokenAction();
        this.refreshTokenAction = refreshTokenAction;
    }

    /**
     * Initialize the singleton instance
     * @param getTokenAction - Initial authentication token
     * @param refreshTokenAction - Optional callback to refresh the authentication token
     */
    static initialize(getTokenAction: () => string, refreshTokenAction?: () => Promise<string | Error>): void {
        TokenService.instance = new TokenService(getTokenAction, refreshTokenAction);
    }

    /**
     * Get the singleton instance
     * @returns TokenService instance
     * @throws Error if not initialized
     */
    static getInstance(): TokenService {
        if (!TokenService.instance) {
            throw new Error('TokenService not initialized. Call TokenService.initialize() first.');
        }
        return TokenService.instance;
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
        await this.updateEditorToken();
        return result;
    }

    async updateEditorToken(): Promise<void> {
        await window.StudioUISDK.configuration.setValue(
            WellKnownConfigurationKeys.GraFxStudioAuthToken,
            this.currentToken,
        );
    }
}

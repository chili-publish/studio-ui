/* eslint-disable @typescript-eslint/no-explicit-any */
import { WellKnownConfigurationKeys } from '@chili-publish/studio-sdk';
import { TokenService } from '../../services/TokenService';

jest.unmock('../../services/TokenService');

describe('TokenService', () => {
    const initialToken = 'initial-token';
    const refreshedToken = 'refreshed-token';

    beforeEach(() => {
        (TokenService as any).instance = null;
        window.StudioUISDK.configuration.setValue = jest.fn().mockResolvedValue(undefined);
    });

    describe('getInstance', () => {
        it('throws when not initialized', () => {
            expect(() => TokenService.getInstance()).toThrow(
                'TokenService not initialized. Call TokenService.initialize() first.',
            );
        });

        it('returns the singleton after initialize', () => {
            TokenService.initialize(() => initialToken);

            const instance = TokenService.getInstance();

            expect(instance).toBe(TokenService.getInstance());
            expect(instance.getToken()).toBe(initialToken);
        });
    });

    describe('getToken', () => {
        it('returns the token from getTokenAction at initialization', () => {
            TokenService.initialize(() => initialToken);

            expect(TokenService.getInstance().getToken()).toBe(initialToken);
        });
    });

    describe('refreshToken', () => {
        it('throws when refreshTokenAction is not provided', async () => {
            TokenService.initialize(() => initialToken);

            await expect(TokenService.getInstance().refreshToken()).rejects.toThrow(
                'The authentication token has expired, and a method to obtain a new one is not provided.',
            );
        });

        it('throws when refreshTokenAction returns an Error', async () => {
            const refreshError = new Error('refresh failed');
            TokenService.initialize(
                () => initialToken,
                async () => refreshError,
            );

            await expect(TokenService.getInstance().refreshToken()).rejects.toThrow(refreshError);
        });

        it('updates the token and editor configuration by default', async () => {
            const refreshTokenAction = jest.fn().mockResolvedValue(refreshedToken);
            TokenService.initialize(() => initialToken, refreshTokenAction);

            const result = await TokenService.getInstance().refreshToken();

            expect(refreshTokenAction).toHaveBeenCalled();
            expect(result).toBe(refreshedToken);
            expect(TokenService.getInstance().getToken()).toBe(refreshedToken);
            expect(window.StudioUISDK.configuration.setValue).toHaveBeenCalledWith(
                WellKnownConfigurationKeys.GraFxStudioAuthToken,
                refreshedToken,
            );
        });

        it('updates the token without updating editor configuration when updateEditorToken is false', async () => {
            const refreshTokenAction = jest.fn().mockResolvedValue(refreshedToken);
            TokenService.initialize(() => initialToken, refreshTokenAction);

            const result = await TokenService.getInstance().refreshToken(false);

            expect(result).toBe(refreshedToken);
            expect(TokenService.getInstance().getToken()).toBe(refreshedToken);
            expect(window.StudioUISDK.configuration.setValue).not.toHaveBeenCalled();
        });
    });

    describe('updateEditorToken', () => {
        it('sets the current token in the editor SDK configuration', async () => {
            TokenService.initialize(() => initialToken);

            await TokenService.getInstance().updateEditorToken();

            expect(window.StudioUISDK.configuration.setValue).toHaveBeenCalledWith(
                WellKnownConfigurationKeys.GraFxStudioAuthToken,
                initialToken,
            );
        });
    });
});

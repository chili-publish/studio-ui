/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AuthRefreshRequest,
    AuthRefreshTypeEnum,
    ConnectorType,
    ConnectorSupportedAuth,
    GrafxTokenAuthCredentials,
} from '@chili-publish/studio-sdk';
import { resolveConnectorSupportedAuth, useEditorAuthExpired } from 'src/core/hooks/useEditorAuthExpired';
import { TokenService } from 'src/services/TokenService';
import { ConnectorAuthenticationResult } from 'src/types/ConnectorAuthenticationResult';
import { renderHookWithProviders } from '@tests/mocks/Provider';

const baseConnectorDefinition = {
    id: 'connector-123',
    type: ConnectorType.media,
    supportedAuthentication: {
        browser: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
        server: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
        integration: [ConnectorSupportedAuth.None],
    },
};

describe('useEditorAuthExpired', () => {
    const mockOnConnectorAuthenticationRequested = jest.fn();
    const mockCreateProcessFn = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle connector authentication with modal (oAuth2)', async () => {
        const mockAuthResult: ConnectorAuthenticationResult = {
            type: 'authenticated',
        };

        mockOnConnectorAuthenticationRequested.mockResolvedValue(mockAuthResult);
        mockCreateProcessFn.mockImplementation((fn) => (typeof fn === 'function' ? fn() : fn));

        const { result } = renderHookWithProviders(() =>
            useEditorAuthExpired(mockOnConnectorAuthenticationRequested, mockCreateProcessFn),
        );
        const handleAuthExpired = result.current;

        const request: AuthRefreshRequest = {
            type: AuthRefreshTypeEnum.any,
            connectorId: 'connector-123',
            remoteConnectorId: 'remote-123',
            headerValue: 'oAuth2AuthorizationCode',
            connectorDefinition: {
                ...baseConnectorDefinition,
                name: 'Test Connector',
                externalSourceId: 'hub-abc_1.0.0',
            },
        };

        const authResult = await handleAuthExpired(request);

        expect(mockCreateProcessFn).toHaveBeenCalled();
        expect(mockOnConnectorAuthenticationRequested).toHaveBeenCalledWith({
            id: 'remote-123',
            name: 'Test Connector',
            supportedAuth: 'oAuth2AuthorizationCode',
            connectorHubId: 'hub-abc',
        });
        expect(authResult).toEqual(mockAuthResult);
    });

    it('should handle connector authentication with requestWithoutModal (none)', async () => {
        const mockAuthResult: ConnectorAuthenticationResult = {
            type: 'authenticated',
        };

        mockOnConnectorAuthenticationRequested.mockResolvedValue(mockAuthResult);
        mockCreateProcessFn.mockImplementation((res) => Promise.resolve(res as any));

        const { result } = renderHookWithProviders(() =>
            useEditorAuthExpired(mockOnConnectorAuthenticationRequested, mockCreateProcessFn),
        );
        const handleAuthExpired = result.current;

        const request: AuthRefreshRequest = {
            type: AuthRefreshTypeEnum.any,
            connectorId: 'connector-123',
            remoteConnectorId: 'remote-123',
            headerValue: null,
            connectorDefinition: {
                ...baseConnectorDefinition,
                name: 'No-Auth Connector',
                supportedAuthentication: {
                    browser: [ConnectorSupportedAuth.None],
                    server: [ConnectorSupportedAuth.None],
                    integration: [ConnectorSupportedAuth.None],
                },
            },
        };

        const authResult = await handleAuthExpired(request);

        expect(mockOnConnectorAuthenticationRequested).toHaveBeenCalledWith({
            id: 'remote-123',
            name: 'No-Auth Connector',
            supportedAuth: 'none',
        });
        expect(mockCreateProcessFn).toHaveBeenCalledWith(mockAuthResult, 'No-Auth Connector', 'remote-123');
        expect(authResult).toEqual(mockAuthResult);
    });

    it('should return error when oAuth2 auth handler is not configured', async () => {
        const errorResult = {
            type: 'error',
            error: new Error('Authorization handler is not configured for connector "OAuth Connector"'),
        };

        mockCreateProcessFn.mockImplementation((res) => Promise.resolve(res as any));

        const { result } = renderHookWithProviders(() => useEditorAuthExpired(undefined, mockCreateProcessFn));
        const handleAuthExpired = result.current;

        const request: AuthRefreshRequest = {
            type: AuthRefreshTypeEnum.any,
            connectorId: 'connector-123',
            remoteConnectorId: 'remote-123',
            headerValue: 'oAuth2AuthorizationCode',
            connectorDefinition: {
                ...baseConnectorDefinition,
                name: 'OAuth Connector',
            },
        };

        const authResult = await handleAuthExpired(request);

        expect(mockCreateProcessFn).toHaveBeenCalledWith(errorResult, 'OAuth Connector', 'remote-123');
        expect(authResult).toEqual(errorResult);
    });

    it('should return error when none auth handler is not configured', async () => {
        const errorResult = {
            type: 'error',
            error: new Error('Authorization handler is not configured for connector "No-Auth Connector"'),
        };

        mockCreateProcessFn.mockImplementation((res) => Promise.resolve(res as any));

        const { result } = renderHookWithProviders(() => useEditorAuthExpired(undefined, mockCreateProcessFn));
        const handleAuthExpired = result.current;

        const request: AuthRefreshRequest = {
            type: AuthRefreshTypeEnum.any,
            connectorId: 'connector-123',
            remoteConnectorId: 'remote-123',
            headerValue: null,
            connectorDefinition: {
                ...baseConnectorDefinition,
                name: 'No-Auth Connector',
                supportedAuthentication: {
                    browser: [ConnectorSupportedAuth.None],
                    server: [ConnectorSupportedAuth.None],
                    integration: [ConnectorSupportedAuth.None],
                },
            },
        };

        const authResult = await handleAuthExpired(request);

        expect(mockCreateProcessFn).toHaveBeenCalledWith(errorResult, 'No-Auth Connector', 'remote-123');
        expect(authResult).toEqual(errorResult);
    });

    it('should handle connector authentication with error handling (unsupported auth)', async () => {
        const errorResult = {
            type: 'error',
            error: new Error('Authorization failed for connector "Test Connector"'),
        };

        mockCreateProcessFn.mockImplementation((result) => Promise.resolve(result as any));

        const { result } = renderHookWithProviders(() =>
            useEditorAuthExpired(mockOnConnectorAuthenticationRequested, mockCreateProcessFn),
        );
        const handleAuthExpired = result.current;

        const request: AuthRefreshRequest = {
            type: AuthRefreshTypeEnum.any,
            connectorId: 'connector-123',
            remoteConnectorId: 'remote-123',
            headerValue: 'some-other-auth',
            connectorDefinition: {
                ...baseConnectorDefinition,
                name: 'Test Connector',
                supportedAuthentication: {
                    browser: [ConnectorSupportedAuth.StaticKey],
                    server: [ConnectorSupportedAuth.StaticKey],
                    integration: [ConnectorSupportedAuth.None],
                },
            },
        };

        const authResult = await handleAuthExpired(request);

        expect(mockOnConnectorAuthenticationRequested).not.toHaveBeenCalled();
        expect(mockCreateProcessFn).toHaveBeenCalledWith(
            {
                type: 'error',
                error: new Error('Authorization failed for connector "Test Connector"'),
            },
            'Test Connector',
            'remote-123',
        );
        expect(authResult).toEqual(errorResult);
    });

    it('should refresh grafx token without updating editor configuration', async () => {
        const mockRefreshToken = jest.fn().mockResolvedValue('refreshed-token');
        (TokenService.getInstance as jest.Mock).mockReturnValue({
            refreshToken: mockRefreshToken,
        });

        const { result } = renderHookWithProviders(() =>
            useEditorAuthExpired(mockOnConnectorAuthenticationRequested, mockCreateProcessFn),
        );
        const handleAuthExpired = result.current;

        const request: AuthRefreshRequest = {
            type: AuthRefreshTypeEnum.grafxToken,
        };

        const authResult = await handleAuthExpired(request);

        expect(mockRefreshToken).toHaveBeenCalledWith(false);
        expect(authResult).toEqual(new GrafxTokenAuthCredentials('refreshed-token'));
    });

    it('should handle errors gracefully', async () => {
        (TokenService.getInstance as jest.Mock).mockReturnValue({
            refreshToken: jest.fn().mockRejectedValue(new Error('Test error')),
        });

        const { result } = renderHookWithProviders(() => useEditorAuthExpired(undefined, mockCreateProcessFn));
        const handleAuthExpired = result.current;

        const request: AuthRefreshRequest = {
            type: AuthRefreshTypeEnum.grafxToken,
        };

        const authResult = await handleAuthExpired(request);

        expect(authResult).toBeNull();
    });

    describe('integration logic', () => {
        const integrationHookOptions = { preloadedState: { appConfig: { isIntegration: true } } };

        const renderIntegrationHook = (
            onAuthRequested:
                | typeof mockOnConnectorAuthenticationRequested
                | undefined = mockOnConnectorAuthenticationRequested,
        ) =>
            renderHookWithProviders(
                () => useEditorAuthExpired(onAuthRequested, mockCreateProcessFn),
                integrationHookOptions,
            ).result.current;

        it('should use none (token injection) when integration auth is none and browser auth is oAuth2', async () => {
            const mockAuthResult: ConnectorAuthenticationResult = {
                type: 'authenticated',
            };

            mockOnConnectorAuthenticationRequested.mockResolvedValue(mockAuthResult);
            mockCreateProcessFn.mockImplementation((res) => Promise.resolve(res as any));

            const handleAuthExpired = renderIntegrationHook();

            const request: AuthRefreshRequest = {
                type: AuthRefreshTypeEnum.any,
                connectorId: 'connector-123',
                remoteConnectorId: 'remote-123',
                headerValue: 'oAuth2AuthorizationCode',
                connectorDefinition: {
                    ...baseConnectorDefinition,
                    name: 'Integration Connector',
                    supportedAuthentication: {
                        browser: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                        server: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                        integration: [ConnectorSupportedAuth.None],
                    },
                },
            };

            const authResult = await handleAuthExpired(request);

            expect(mockOnConnectorAuthenticationRequested).toHaveBeenCalledWith({
                id: 'remote-123',
                name: 'Integration Connector',
                supportedAuth: 'none',
            });
            expect(mockCreateProcessFn).toHaveBeenCalledWith(mockAuthResult, 'Integration Connector', 'remote-123');
            expect(authResult).toEqual(mockAuthResult);
        });

        it('should error when token-injection handler is not configured', async () => {
            const errorResult = {
                type: 'error',
                error: new Error('Authorization handler is not configured for connector "Integration Connector"'),
            };

            mockCreateProcessFn.mockImplementation((res) => Promise.resolve(res as any));

            const { result } = renderHookWithProviders(
                () => useEditorAuthExpired(undefined, mockCreateProcessFn),
                integrationHookOptions,
            );
            const handleAuthExpired = result.current;

            const request: AuthRefreshRequest = {
                type: AuthRefreshTypeEnum.any,
                connectorId: 'connector-123',
                remoteConnectorId: 'remote-123',
                headerValue: 'oAuth2AuthorizationCode',
                connectorDefinition: {
                    ...baseConnectorDefinition,
                    name: 'Integration Connector',
                    supportedAuthentication: {
                        browser: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                        server: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                        integration: [ConnectorSupportedAuth.None],
                    },
                },
            };

            const authResult = await handleAuthExpired(request);

            expect(mockCreateProcessFn).toHaveBeenCalledWith(errorResult, 'Integration Connector', 'remote-123');
            expect(authResult).toEqual(errorResult);
        });

        it('should error clearly when integration auth is oAuth2AuthorizationCode', async () => {
            const errorResult = {
                type: 'error',
                error: new Error('Authorization failed for connector "Integration Connector"'),
            };

            mockCreateProcessFn.mockImplementation((res) => Promise.resolve(res as any));

            const handleAuthExpired = renderIntegrationHook();

            const request: AuthRefreshRequest = {
                type: AuthRefreshTypeEnum.any,
                connectorId: 'connector-123',
                remoteConnectorId: 'remote-123',
                headerValue: 'oAuth2AuthorizationCode',
                connectorDefinition: {
                    ...baseConnectorDefinition,
                    name: 'Integration Connector',
                    supportedAuthentication: {
                        browser: [ConnectorSupportedAuth.None],
                        server: [ConnectorSupportedAuth.None],
                        integration: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                    },
                },
            };

            const authResult = await handleAuthExpired(request);

            expect(mockOnConnectorAuthenticationRequested).not.toHaveBeenCalled();
            expect(mockCreateProcessFn).toHaveBeenCalledWith(errorResult, 'Integration Connector', 'remote-123');
            expect(authResult).toEqual(errorResult);
        });

        it('should error clearly when both browser and integration auth are oAuth2AuthorizationCode', async () => {
            mockCreateProcessFn.mockImplementation((res) => Promise.resolve(res as any));

            const handleAuthExpired = renderIntegrationHook();

            const request: AuthRefreshRequest = {
                type: AuthRefreshTypeEnum.any,
                connectorId: 'connector-123',
                remoteConnectorId: 'remote-123',
                headerValue: 'oAuth2AuthorizationCode',
                connectorDefinition: {
                    ...baseConnectorDefinition,
                    name: 'Integration Connector',
                    supportedAuthentication: {
                        browser: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                        server: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                        integration: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                    },
                },
            };

            await handleAuthExpired(request);

            expect(mockOnConnectorAuthenticationRequested).not.toHaveBeenCalled();
            expect(mockCreateProcessFn).toHaveBeenCalledWith(
                {
                    type: 'error',
                    error: new Error('Authorization failed for connector "Integration Connector"'),
                },
                'Integration Connector',
                'remote-123',
            );
        });

        it('should authenticate against non-none integration auth', async () => {
            const errorResult = {
                type: 'error',
                error: new Error('Authorization failed for connector "Integration Connector"'),
            };

            mockCreateProcessFn.mockImplementation((res) => Promise.resolve(res as any));

            const handleAuthExpired = renderIntegrationHook();

            const request: AuthRefreshRequest = {
                type: AuthRefreshTypeEnum.any,
                connectorId: 'connector-123',
                remoteConnectorId: 'remote-123',
                headerValue: 'staticKey',
                connectorDefinition: {
                    ...baseConnectorDefinition,
                    name: 'Integration Connector',
                    supportedAuthentication: {
                        browser: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                        server: [ConnectorSupportedAuth.StaticKey],
                        integration: [ConnectorSupportedAuth.StaticKey],
                    },
                },
            };

            const authResult = await handleAuthExpired(request);

            expect(mockOnConnectorAuthenticationRequested).not.toHaveBeenCalled();
            expect(mockCreateProcessFn).toHaveBeenCalledWith(errorResult, 'Integration Connector', 'remote-123');
            expect(authResult).toEqual(errorResult);
        });

        it('should fall back to browser auth when integration auth is none but browser auth is not oAuth2', async () => {
            const errorResult = {
                type: 'error',
                error: new Error('Authorization failed for connector "Integration Connector"'),
            };

            mockCreateProcessFn.mockImplementation((res) => Promise.resolve(res as any));

            const handleAuthExpired = renderIntegrationHook();

            const request: AuthRefreshRequest = {
                type: AuthRefreshTypeEnum.any,
                connectorId: 'connector-123',
                remoteConnectorId: 'remote-123',
                headerValue: 'staticKey',
                connectorDefinition: {
                    ...baseConnectorDefinition,
                    name: 'Integration Connector',
                    supportedAuthentication: {
                        browser: [ConnectorSupportedAuth.StaticKey],
                        server: [ConnectorSupportedAuth.StaticKey],
                        integration: [ConnectorSupportedAuth.None],
                    },
                },
            };

            const authResult = await handleAuthExpired(request);

            expect(mockOnConnectorAuthenticationRequested).not.toHaveBeenCalled();
            expect(mockCreateProcessFn).toHaveBeenCalledWith(errorResult, 'Integration Connector', 'remote-123');
            expect(authResult).toEqual(errorResult);
        });

        it('should fall back to browser oAuth2 when integration auth is empty', async () => {
            const mockAuthResult: ConnectorAuthenticationResult = {
                type: 'authenticated',
            };

            mockOnConnectorAuthenticationRequested.mockResolvedValue(mockAuthResult);
            mockCreateProcessFn.mockImplementation((fn) => (typeof fn === 'function' ? fn() : fn));

            const handleAuthExpired = renderIntegrationHook();

            const request: AuthRefreshRequest = {
                type: AuthRefreshTypeEnum.any,
                connectorId: 'connector-123',
                remoteConnectorId: 'remote-123',
                headerValue: 'oAuth2AuthorizationCode',
                connectorDefinition: {
                    ...baseConnectorDefinition,
                    name: 'Integration Connector',
                    supportedAuthentication: {
                        browser: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                        server: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                        integration: [],
                    },
                },
            };

            const authResult = await handleAuthExpired(request);

            expect(mockOnConnectorAuthenticationRequested).toHaveBeenCalledWith({
                id: 'remote-123',
                name: 'Integration Connector',
                supportedAuth: 'oAuth2AuthorizationCode',
            });
            expect(authResult).toEqual(mockAuthResult);
        });

        it('should keep using browser oAuth2 when not in integration mode even if integration auth is none', async () => {
            const mockAuthResult: ConnectorAuthenticationResult = {
                type: 'authenticated',
            };

            mockOnConnectorAuthenticationRequested.mockResolvedValue(mockAuthResult);
            mockCreateProcessFn.mockImplementation((fn) => (typeof fn === 'function' ? fn() : fn));

            const { result } = renderHookWithProviders(() =>
                useEditorAuthExpired(mockOnConnectorAuthenticationRequested, mockCreateProcessFn),
            );
            const handleAuthExpired = result.current;

            const request: AuthRefreshRequest = {
                type: AuthRefreshTypeEnum.any,
                connectorId: 'connector-123',
                remoteConnectorId: 'remote-123',
                headerValue: 'oAuth2AuthorizationCode',
                connectorDefinition: {
                    ...baseConnectorDefinition,
                    name: 'Browser Connector',
                    supportedAuthentication: {
                        browser: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                        server: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                        integration: [ConnectorSupportedAuth.None],
                    },
                },
            };

            const authResult = await handleAuthExpired(request);

            expect(mockOnConnectorAuthenticationRequested).toHaveBeenCalledWith({
                id: 'remote-123',
                name: 'Browser Connector',
                supportedAuth: 'oAuth2AuthorizationCode',
            });
            expect(authResult).toEqual(mockAuthResult);
        });
    });
});

describe('resolveConnectorSupportedAuth', () => {
    it('returns browser auth when not in integration mode', () => {
        expect(
            resolveConnectorSupportedAuth(false, {
                browser: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                integration: [ConnectorSupportedAuth.None],
            }),
        ).toEqual({ handling: 'viaModal', supportedAuth: ConnectorSupportedAuth.OAuth2AuthorizationCode });
    });

    it('returns none when integration is none and browser is oAuth2AuthorizationCode', () => {
        expect(
            resolveConnectorSupportedAuth(true, {
                browser: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                integration: [ConnectorSupportedAuth.None],
            }),
        ).toEqual({ handling: 'directCall', supportedAuth: ConnectorSupportedAuth.None });
    });

    it('returns integration auth when it is not none', () => {
        expect(
            resolveConnectorSupportedAuth(true, {
                browser: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                integration: [ConnectorSupportedAuth.StaticKey],
            }),
        ).toEqual({ handling: 'alwaysError', supportedAuth: ConnectorSupportedAuth.StaticKey });
    });

    it('returns browser auth when integration is none and browser is not oAuth2AuthorizationCode', () => {
        expect(
            resolveConnectorSupportedAuth(true, {
                browser: [ConnectorSupportedAuth.StaticKey],
                integration: [ConnectorSupportedAuth.None],
            }),
        ).toEqual({ handling: 'alwaysError', supportedAuth: ConnectorSupportedAuth.StaticKey });
    });

    it('returns browser auth when isIntegration is undefined', () => {
        expect(
            resolveConnectorSupportedAuth(undefined, {
                browser: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
                integration: [ConnectorSupportedAuth.None],
            }),
        ).toEqual({ handling: 'viaModal', supportedAuth: ConnectorSupportedAuth.OAuth2AuthorizationCode });
    });

    it('returns browser auth when integration auth is missing', () => {
        expect(
            resolveConnectorSupportedAuth(true, {
                browser: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
            }),
        ).toEqual({ handling: 'viaModal', supportedAuth: ConnectorSupportedAuth.OAuth2AuthorizationCode });
    });

    it('returns integration oAuth2AuthorizationCode when that is the integration auth', () => {
        expect(
            resolveConnectorSupportedAuth(true, {
                browser: [ConnectorSupportedAuth.None],
                integration: [ConnectorSupportedAuth.OAuth2AuthorizationCode],
            }),
        ).toEqual({ handling: 'alwaysError', supportedAuth: ConnectorSupportedAuth.OAuth2AuthorizationCode });
    });
});

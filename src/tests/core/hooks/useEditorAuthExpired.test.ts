/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRefreshRequest, AuthRefreshTypeEnum, ConnectorType, SupportedAuth } from '@chili-publish/studio-sdk';
import { useEditorAuthExpired } from 'src/core/hooks/useEditorAuthExpired';
import { TokenService } from 'src/services/TokenService';
import { ConnectorAuthenticationResult } from 'src/types/ConnectorAuthenticationResult';
import { renderHookWithProviders } from '@tests/mocks/Provider';

const baseConnectorDefinition = {
    id: 'connector-123',
    type: ConnectorType.media,
    supportedAuthentication: {
        browser: [SupportedAuth.OAuth2AuthorizationCode],
        server: [SupportedAuth.OAuth2AuthorizationCode],
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
                    browser: [SupportedAuth.None],
                    server: [SupportedAuth.None],
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
                    browser: [SupportedAuth.None],
                    server: [SupportedAuth.None],
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
                    browser: [SupportedAuth.StaticKey],
                    server: [SupportedAuth.StaticKey],
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

    it('should handle errors gracefully', async () => {
        (TokenService.getInstance as jest.Mock).mockReturnValue({
            refreshToken: jest.fn().mockRejectedValue(new Error('Test error')),
        });

        const { result } = renderHookWithProviders(() => useEditorAuthExpired(undefined, mockCreateProcessFn));
        const handleAuthExpired = result.current;

        const request: AuthRefreshRequest = {
            type: AuthRefreshTypeEnum.grafxToken,
            connectorId: '',
            remoteConnectorId: '',
            headerValue: '',
            connectorDefinition: {
                ...baseConnectorDefinition,
                name: '',
            },
        };

        const authResult = await handleAuthExpired(request);

        expect(authResult).toBeNull();
    });
});

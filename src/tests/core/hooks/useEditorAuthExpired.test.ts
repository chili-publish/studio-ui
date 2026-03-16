/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRefreshRequest, AuthRefreshTypeEnum } from '@chili-publish/studio-sdk';
import { useEditorAuthExpired } from 'src/core/hooks/useEditorAuthExpired';
import { TokenService } from 'src/services/TokenService';
import { ConnectorAuthenticationResult } from 'src/types/ConnectorAuthenticationResult';
import { renderHookWithProviders } from '@tests/mocks/Provider';

describe('useEditorAuthExpired', () => {
    const mockOnConnectorAuthenticationRequested = jest.fn();
    const mockCreateProcessFn = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle connector authentication with modal (oAuth2)', async () => {
        const mockConnector = { name: 'Test Connector' };
        const mockAuthResult: ConnectorAuthenticationResult = {
            type: 'authenticated',
        };

        window.StudioUISDK = {
            connector: {
                getById: jest.fn().mockResolvedValue({ parsedData: mockConnector }),
            },
        } as any;

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
        };

        const authResult = await handleAuthExpired(request);

        expect(mockCreateProcessFn).toHaveBeenCalled();
        expect(mockOnConnectorAuthenticationRequested).toHaveBeenCalledWith({
            id: 'remote-123',
            name: 'Test Connector',
            supportedAuth: 'oAuth2AuthorizationCode',
        });
        expect(authResult).toEqual(mockAuthResult);
    });

    it('should handle connector authentication with requestWithoutModal (none)', async () => {
        const mockConnector = { name: 'No-Auth Connector' };
        const mockAuthResult: ConnectorAuthenticationResult = { type: 'authenticated' };

        window.StudioUISDK = {
            connector: {
                getById: jest.fn().mockResolvedValue({ parsedData: mockConnector }),
            },
        } as any;

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
            headerValue: undefined as any,
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

    it('should handle connector authentication with error handling (unsupported auth)', async () => {
        const mockConnector = { name: 'Test Connector' };
        const errorResult = {
            type: 'error',
            error: new Error('Authorization failed for connector "Test Connector"'),
        };

        window.StudioUISDK = {
            connector: {
                getById: jest.fn().mockResolvedValue({ parsedData: mockConnector }),
            },
        } as any;

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
        };

        const authResult = await handleAuthExpired(request);

        expect(authResult).toBeNull();
    });
});

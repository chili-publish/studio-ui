/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRefreshRequest, AuthRefreshTypeEnum, GrafxTokenAuthCredentials } from '@chili-publish/studio-sdk';
import { useEditorAuthExpired } from 'src/core/hooks/useEditorAuthExpired';
import { ConnectorAuthenticationResult } from 'src/types/ConnectorAuthenticationResult';

jest.mock('@chili-publish/studio-sdk', () => ({
    ...jest.requireActual('@chili-publish/studio-sdk'),
    GrafxTokenAuthCredentials: jest.fn().mockImplementation((token) => ({
        token,
        constructor: { name: 'GrafxTokenAuthCredentials' },
    })),
}));

describe('useEditorAuthExpired', () => {
    const mockOnAuthenticationExpired = jest.fn();
    const mockUpdateToken = jest.fn();
    const mockOnConnectorAuthenticationRequested = jest.fn();
    const mockCreateProcessFn = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle Grafx token refresh', async () => {
        const newToken = 'new-token-123';
        mockOnAuthenticationExpired.mockResolvedValue(newToken);

        const handleAuthExpired = useEditorAuthExpired(
            mockOnAuthenticationExpired,
            mockUpdateToken,
            undefined,
            mockCreateProcessFn,
        );

        const request: AuthRefreshRequest = {
            type: AuthRefreshTypeEnum.grafxToken,
            connectorId: '',
            remoteConnectorId: '',
            headerValue: '',
        };

        const result = await handleAuthExpired(request);

        expect(mockOnAuthenticationExpired).toHaveBeenCalled();
        expect(mockUpdateToken).toHaveBeenCalledWith(newToken);
        expect(GrafxTokenAuthCredentials).toHaveBeenCalledWith(newToken);
        expect(result).toEqual({ token: newToken, constructor: { name: 'GrafxTokenAuthCredentials' } });
    });

    it('should handle connector authentication with user impersonation', async () => {
        const mockConnector = { name: 'Test Connector' };
        const mockAuthResult: ConnectorAuthenticationResult = {
            type: 'authentified',
        };

        window.StudioUISDK = {
            connector: {
                getById: jest.fn().mockResolvedValue({ parsedData: mockConnector }),
            },
        } as any;

        mockOnConnectorAuthenticationRequested.mockResolvedValue(mockAuthResult);
        mockCreateProcessFn.mockImplementation((fn) => fn());

        const handleAuthExpired = useEditorAuthExpired(
            mockOnAuthenticationExpired,
            mockUpdateToken,
            mockOnConnectorAuthenticationRequested,
            mockCreateProcessFn,
        );

        const request: AuthRefreshRequest = {
            type: AuthRefreshTypeEnum.any,
            connectorId: 'connector-123',
            remoteConnectorId: 'remote-123',
            headerValue: 'oAuth2AuthorizationCode',
        };

        const result = await handleAuthExpired(request);

        expect(mockCreateProcessFn).toHaveBeenCalled();
        expect(mockOnConnectorAuthenticationRequested).toHaveBeenCalledWith('remote-123');
        expect(result).toEqual(mockAuthResult);
    });

    it('should handle connector authentication without user impersonation', async () => {
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

        mockCreateProcessFn.mockImplementation((result) => result);

        const handleAuthExpired = useEditorAuthExpired(
            mockOnAuthenticationExpired,
            mockUpdateToken,
            mockOnConnectorAuthenticationRequested,
            mockCreateProcessFn,
        );

        const request: AuthRefreshRequest = {
            type: AuthRefreshTypeEnum.any,
            connectorId: 'connector-123',
            remoteConnectorId: 'remote-123',
            headerValue: 'some-other-auth',
        };

        const result = await handleAuthExpired(request);

        expect(mockCreateProcessFn).toHaveBeenCalledWith(
            {
                type: 'error',
                error: new Error('Authorization failed for connector "Test Connector"'),
            },
            'Test Connector',
            'remote-123',
        );
        expect(result).toEqual(errorResult);
    });

    it('should handle errors gracefully', async () => {
        mockOnAuthenticationExpired.mockRejectedValue(new Error('Test error'));

        const handleAuthExpired = useEditorAuthExpired(
            mockOnAuthenticationExpired,
            mockUpdateToken,
            undefined,
            mockCreateProcessFn,
        );

        const request: AuthRefreshRequest = {
            type: AuthRefreshTypeEnum.grafxToken,
            connectorId: '',
            remoteConnectorId: '',
            headerValue: '',
        };

        const result = await handleAuthExpired(request);

        expect(result).toBeNull();
    });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRefreshRequest, AuthRefreshTypeEnum } from '@chili-publish/studio-sdk';
import { useEditorAuthExpired } from 'src/core/hooks/useEditorAuthExpired';
import { TokenService } from 'src/services/TokenService';
import { ConnectorAuthenticationResult } from 'src/types/ConnectorAuthenticationResult';

describe('useEditorAuthExpired', () => {
    const mockOnConnectorAuthenticationRequested = jest.fn();
    const mockCreateProcessFn = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
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

        const handleAuthExpired = useEditorAuthExpired(mockOnConnectorAuthenticationRequested, mockCreateProcessFn);

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

        const handleAuthExpired = useEditorAuthExpired(mockOnConnectorAuthenticationRequested, mockCreateProcessFn);

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
        // Set up the mock instance
        (TokenService.getInstance as jest.Mock).mockReturnValue({
            refreshToken: jest.fn().mockRejectedValue(new Error('Test error')),
        });
        // Mock the initialize method to store the refreshTokenAction

        const handleAuthExpired = useEditorAuthExpired(undefined, mockCreateProcessFn);

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

import { AuthRefreshRequest, AuthRefreshTypeEnum, GrafxTokenAuthCredentials } from '@chili-publish/studio-sdk';
import { CreateProcessFn } from 'src/components/connector-authentication/useConnectorAuthentication';
import { TokenService } from 'src/services/TokenService';
import { ConnectorAuthenticationResult } from 'src/types/ConnectorAuthenticationResult';
import { ConnectorAuthenticationRequest } from 'src/types/types';
import { normalizeSupportedAuth } from 'src/utils/connectors';

/** How to handle connector auth for a given supportedAuth value */
export type ConnectorAuthHandling = 'viaModal' | 'directCall' | 'alwaysError';

/**
 * Static config: which handling to use per supportedAuth.
 * - viaModal: show modal first, then call onConnectorAuthenticationRequested on confirm
 * - directCall: call onConnectorAuthenticationRequested and feed result to createProcessFn (no modal)
 * - alwaysError: show immediate error (createProcessFn with error)
 */
const SUPPORTED_AUTH_HANDLING: Record<string, ConnectorAuthHandling> = {
    oAuth2AuthorizationCode: 'viaModal',
    none: 'directCall',
    unknown: 'alwaysError',
};

export const useEditorAuthExpired = (
    onConnectorAuthenticationRequested:
        | undefined
        | ((request: ConnectorAuthenticationRequest) => Promise<ConnectorAuthenticationResult>),
    createProcessFn: CreateProcessFn,
) => {
    const handleAuthExpired = async (request: AuthRefreshRequest) => {
        try {
            if (request.type === AuthRefreshTypeEnum.grafxToken) {
                const newToken = await TokenService.getInstance().refreshToken();
                return new GrafxTokenAuthCredentials(newToken);
            }

            if (request.type === AuthRefreshTypeEnum.any) {
                const { parsedData: engineConnector } = await window.StudioUISDK.connector.getById(request.connectorId);
                const name = engineConnector?.name ?? '';
                const supportedAuth = normalizeSupportedAuth(request.headerValue);
                const handling = SUPPORTED_AUTH_HANDLING[supportedAuth];

                const authRequest: ConnectorAuthenticationRequest = {
                    id: request.remoteConnectorId,
                    name,
                    supportedAuth,
                };

                if ((handling === 'viaModal' || handling === 'directCall') && !onConnectorAuthenticationRequested) {
                    return await createProcessFn(
                        {
                            type: 'error',
                            error: new Error(`Authorization handler is not configured for connector "${name}"`),
                        },
                        name,
                        request.remoteConnectorId,
                    );
                }

                if (handling === 'viaModal' && onConnectorAuthenticationRequested) {
                    return await createProcessFn(
                        async () => onConnectorAuthenticationRequested(authRequest),
                        name,
                        request.remoteConnectorId,
                    );
                }

                if (handling === 'directCall' && onConnectorAuthenticationRequested) {
                    let authResult: ConnectorAuthenticationResult;
                    try {
                        authResult = await onConnectorAuthenticationRequested(authRequest);
                    } catch (error) {
                        authResult = {
                            type: 'error',
                            error: new Error(`Authorization failed for connector "${name}"`, {
                                cause: error,
                            }),
                        };
                    }
                    return await createProcessFn(authResult, name, request.remoteConnectorId);
                }

                if (handling === 'alwaysError') {
                    return await createProcessFn(
                        {
                            type: 'error',
                            error: new Error(`Authorization failed for connector "${name}"`),
                        },
                        name,
                        request.remoteConnectorId,
                    );
                }
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return null;
        }
        return null;
    };

    return handleAuthExpired;
};

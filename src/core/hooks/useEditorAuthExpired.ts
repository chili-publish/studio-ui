import {
    AuthRefreshRequest,
    AuthRefreshTypeEnum,
    GrafxTokenAuthCredentials,
    ConnectorSupportedAuth,
} from '@chili-publish/studio-sdk';
import { useSelector } from 'react-redux';
import { CreateProcessFn } from 'src/components/connector-authentication/useConnectorAuthentication';
import { TokenService } from 'src/services/TokenService';
import { selectIsIntegration } from 'src/store/reducers/appConfigReducer';
import { ConnectorAuthenticationResult } from 'src/types/ConnectorAuthenticationResult';
import { ConnectorAuthenticationRequest } from 'src/types/types';
import { parseConnectorHubIdFromExternalSourceId } from 'src/utils/connectors';

/** How to handle connector auth for a given supportedAuth value */
export type ConnectorAuthHandling = 'viaModal' | 'directCall' | 'alwaysError';

/**
 * Static config: which handling to use per supportedAuth.
 * - viaModal: show modal first, then call onConnectorAuthenticationRequested on confirm
 * - directCall: call onConnectorAuthenticationRequested and feed result to createProcessFn (no modal)
 * - alwaysError: show immediate error (createProcessFn with error)
 */
const SUPPORTED_AUTH_HANDLING: Partial<Record<ConnectorSupportedAuth, ConnectorAuthHandling>> = {
    [ConnectorSupportedAuth.OAuth2AuthorizationCode]: 'viaModal',
    [ConnectorSupportedAuth.None]: 'directCall',
};

type ConnectorAuthSelection = {
    browser: ConnectorSupportedAuth[];
    integration?: ConnectorSupportedAuth[];
};

/**
 * Picks the auth type to run when connector auth expires.
 * - Integration + integration auth `none` + browser auth `oAuth2AuthorizationCode` → integration auth (`none`, token injection)
 * - Integration + integration auth other than `none` → integration auth (OAuth2 authorization code is always an error)
 * - Otherwise → browser auth
 */
export function resolveConnectorSupportedAuth(
    isIntegration: boolean | undefined,
    supportedAuthentication: ConnectorAuthSelection,
): ConnectorSupportedAuth {
    const browserAuth = supportedAuthentication.browser[0];
    const integrationAuth = supportedAuthentication.integration?.[0];

    if (
        isIntegration &&
        integrationAuth === ConnectorSupportedAuth.None &&
        browserAuth === ConnectorSupportedAuth.OAuth2AuthorizationCode
    ) {
        return ConnectorSupportedAuth.None;
    }

    if (isIntegration && integrationAuth != null && integrationAuth !== ConnectorSupportedAuth.None) {
        return integrationAuth;
    }

    return browserAuth;
}

export const useEditorAuthExpired = (
    onConnectorAuthenticationRequested:
        | undefined
        | ((request: ConnectorAuthenticationRequest) => Promise<ConnectorAuthenticationResult>),
    createProcessFn: CreateProcessFn,
) => {
    const isIntegration = useSelector(selectIsIntegration);

    const handleAuthExpired = async (request: AuthRefreshRequest) => {
        try {
            if (request.type === AuthRefreshTypeEnum.grafxToken) {
                // Since it runs within Engine refresh context, we don't need to update the editor token via configuration
                const newToken = await TokenService.getInstance().refreshToken(false);
                return new GrafxTokenAuthCredentials(newToken);
            }

            if (request.type === AuthRefreshTypeEnum.any) {
                const { connectorDefinition } = request;
                const name = connectorDefinition.name;
                const integrationAuth = connectorDefinition.supportedAuthentication.integration?.[0];
                const supportedAuth = resolveConnectorSupportedAuth(
                    isIntegration,
                    connectorDefinition.supportedAuthentication,
                );
                const isUnsupportedIntegrationOAuth =
                    isIntegration &&
                    integrationAuth === ConnectorSupportedAuth.OAuth2AuthorizationCode &&
                    supportedAuth === ConnectorSupportedAuth.OAuth2AuthorizationCode;
                const handling: ConnectorAuthHandling = isUnsupportedIntegrationOAuth
                    ? 'alwaysError'
                    : (SUPPORTED_AUTH_HANDLING[supportedAuth] ?? 'alwaysError');
                const connectorHubId = parseConnectorHubIdFromExternalSourceId(connectorDefinition.externalSourceId);

                const authRequest: ConnectorAuthenticationRequest = {
                    id: request.remoteConnectorId,
                    name,
                    supportedAuth,
                    ...(connectorHubId !== undefined ? { connectorHubId } : {}),
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
                    const errorMessage = isUnsupportedIntegrationOAuth
                        ? `oAuth2AuthorizationCode is not supported for connector "${name}" in integration mode`
                        : `Authorization failed for connector "${name}"`;
                    return await createProcessFn(
                        {
                            type: 'error',
                            error: new Error(errorMessage),
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

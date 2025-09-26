import { AuthRefreshRequest, AuthRefreshTypeEnum, GrafxTokenAuthCredentials } from '@chili-publish/studio-sdk';
import { CreateProcessFn } from 'src/components/connector-authentication/useConnectorAuthentication';
import { TokenService } from 'src/services/TokenService';
import { ConnectorAuthenticationResult } from 'src/types/ConnectorAuthenticationResult';

export const useEditorAuthExpired = (
    onConnectorAuthenticationRequested:
        | undefined
        | ((remoteConnectorId: string) => Promise<ConnectorAuthenticationResult>),
    createProcessFn: CreateProcessFn,
) => {
    const handleAuthExpired = async (request: AuthRefreshRequest) => {
        try {
            if (request.type === AuthRefreshTypeEnum.grafxToken) {
                const newToken = await TokenService.getInstance().refreshToken();
                return new GrafxTokenAuthCredentials(newToken);
            }

            // When we made a request through /proxy endpoint and there is a connector authorization failure,
            // request.headerValue won't be empty
            if (request.type === AuthRefreshTypeEnum.any && !!request.headerValue) {
                const { parsedData: connector } = await window.StudioUISDK.connector.getById(request.connectorId);
                const isUserImpersonationRequired =
                    request.headerValue.toLowerCase().includes('oAuth2AuthorizationCode'.toLowerCase()) &&
                    !!onConnectorAuthenticationRequested;

                if (isUserImpersonationRequired) {
                    const result = await createProcessFn(
                        async () => {
                            const res = await onConnectorAuthenticationRequested!(request.remoteConnectorId);
                            return res;
                        },
                        connector?.name ?? '',
                        request.remoteConnectorId,
                    );
                    return result;
                }
                const result = await createProcessFn(
                    {
                        type: 'error',
                        error: new Error(`Authorization failed for connector "${connector?.name}"`),
                    },
                    connector?.name ?? '',
                    request.remoteConnectorId,
                );
                return result;
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

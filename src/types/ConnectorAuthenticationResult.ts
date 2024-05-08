export interface Authentified {
    type: 'authentified';
}

export interface CanceledAuthentication {
    type: 'canceled';
}

export interface AuthenticationTimeout {
    type: 'timeout';
}

export interface AuthenticationWithError {
    type: 'error';
    error: unknown;
}

export type ConnectorAuthenticationResult =
    | Authentified
    | CanceledAuthentication
    | AuthenticationTimeout
    | AuthenticationWithError;

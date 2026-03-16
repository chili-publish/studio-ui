export interface Authenticated {
    // For backward compatibility we need to keep 'authentified' type
    type: 'authentified' | 'authenticated';
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
    | Authenticated
    | CanceledAuthentication
    | AuthenticationTimeout
    | AuthenticationWithError;

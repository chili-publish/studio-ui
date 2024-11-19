import { createContext, ReactNode, useContext, useMemo } from 'react';

export interface AuthToken {
    authToken: string;
}

export const AuthTokenContext = createContext<AuthToken>({ authToken: '' });

export const useAuthToken = () => {
    return useContext(AuthTokenContext);
};

export function AuthTokenProvider(props: { authToken: string; children: ReactNode }) {
    const { authToken, children } = props;

    const contextData = useMemo(() => ({ authToken }), [authToken]);

    return <AuthTokenContext.Provider value={contextData}>{children}</AuthTokenContext.Provider>;
}

import { RefreshedAuthCredendentials } from '@chili-publish/studio-sdk';
import { useCallback, useMemo, useState } from 'react';
import { ConnectorAuthenticationResult } from '../../types/ConnectorAuthenticationResult';

interface Executor {
    handler: () => Promise<ConnectorAuthenticationResult>;
}

type AuthenticationData = {
    [connectorId: string]: {
        connectorName: string;
        authenticationResolvers: Omit<
            // eslint-disable-next-line no-undef
            PromiseWithResolvers<RefreshedAuthCredendentials | null>,
            'promise'
        > | null;
        executor: Executor;
        result: ConnectorAuthenticationResult | null;
    };
};

export const useConnectorAuthentication = () => {
    /*const [authenticationResolvers, setAuthenticationResolvers] = useState<Omit<
        // eslint-disable-next-line no-undef
        PromiseWithResolvers<RefreshedAuthCredendentials | null>,
        'promise'
    > | null>(null);
    const [executor, setExecutor] = useState<Executor | null>(null);
    const [connectorName, setConnectorName] = useState<string>('');
    const [result, setResult] = useState<ConnectorAuthenticationResult | null>(null);*/

    const [authentication, setAuthentication] = useState<AuthenticationData>();

    const resetProcess = useCallback((id: string) => {
        setAuthentication((prev) => {
            delete prev?.[id];
            return { ...prev };
        });
    }, []);

    const getAuthenticationProcess = useCallback(
        (id: string) => {
            const authenticationProcess = authentication?.[id];
            if (!authenticationProcess) return null;

            if (authenticationProcess.authenticationResolvers && authenticationProcess.executor) {
                return {
                    __resolvers: authenticationProcess.authenticationResolvers,
                    async start() {
                        setAuthentication(
                            (prev) =>
                                ({ ...prev, [id]: { ...(prev?.[id] || {}), result: null } } as AuthenticationData),
                        );
                        // setResult(null);
                        try {
                            const executorResult = await authenticationProcess.executor.handler().then((res) => {
                                setAuthentication(
                                    (prev) =>
                                        ({
                                            ...prev,
                                            [id]: { ...(prev?.[id] || {}), result: res },
                                        } as AuthenticationData),
                                );

                                // setResult(res);
                                if (res.type === 'authentified') {
                                    return new RefreshedAuthCredendentials();
                                }
                                // eslint-disable-next-line no-console
                                console.warn(`There is a "${res.type}" issue with authentifying of the connector`);
                                if (res.type === 'error') {
                                    // eslint-disable-next-line no-console
                                    console.error(res.error);
                                }

                                return null;
                            });
                            this.__resolvers.resolve(executorResult);
                        } catch (error) {
                            this.__resolvers.reject(error);
                        } finally {
                            resetProcess(id);
                        }
                    },
                    async cancel() {
                        console.log('here', id);
                        this.__resolvers.resolve(null);
                        resetProcess(id);
                    },
                };
            }
            return null;
        },
        [authentication, resetProcess],
    );

    const createProcess = async (authorizationExecutor: Executor['handler'], name: string, id: string) => {
        const authenticationAwaiter = Promise.withResolvers<RefreshedAuthCredendentials | null>();
        /*setExecutor({
            handler: authorizationExecutor,
        });
        setAuthenticationResolvers({
            resolve: authenticationAwaiter.resolve,
            reject: authenticationAwaiter.reject,
        });
        setConnectorName(name);*/

        setAuthentication((prev) => ({
            ...prev,
            [id]: {
                executor: {
                    handler: authorizationExecutor,
                },
                authenticationResolvers: {
                    resolve: authenticationAwaiter.resolve,
                    reject: authenticationAwaiter.reject,
                },
                connectorName: name,
                result: null,
            },
        }));
        const promiseResult = await authenticationAwaiter.promise;
        return promiseResult;
    };

    return {
        authentication,
        createProcess,
        getAuthenticationProcess,
        //connectorName,
        //result,
    };
};

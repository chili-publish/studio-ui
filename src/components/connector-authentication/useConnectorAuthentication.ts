import { RefreshedAuthCredendentials } from '@chili-publish/studio-sdk';
import { useCallback, useState } from 'react';
import { ConnectorAuthenticationResult } from '../../types/ConnectorAuthenticationResult';

interface Executor {
    handler: () => Promise<ConnectorAuthenticationResult>;
}

export type ConnectorAuthenticationFlow = {
    connectorId: string;
    connectorName: string;
    authenticationResolvers: Omit<PromiseWithResolvers<RefreshedAuthCredendentials | null>, 'promise'> | null;
    executor: Executor | null;
    result: ConnectorAuthenticationResult | null;
};

export const useConnectorAuthentication = () => {
    const [authenticationFlows, setAuthenticationFlows] = useState<ConnectorAuthenticationFlow[]>([]);

    const resetProcess = useCallback((id: string) => {
        setAuthenticationFlows((prev) =>
            prev.map((item) =>
                item.connectorId === id ? { ...item, authenticationResolvers: null, executor: null } : item,
            ),
        );
    }, []);

    const process = useCallback(
        (id: string) => {
            const authenticationProcess = authenticationFlows.find((item) => item.connectorId === id);
            if (!authenticationProcess) return null;

            if (authenticationProcess.authenticationResolvers && authenticationProcess.executor) {
                return {
                    __resolvers: authenticationProcess.authenticationResolvers,
                    async start() {
                        setAuthenticationFlows((prev) =>
                            prev.map((item) => (item.connectorId === id ? { ...item, result: null } : item)),
                        );
                        try {
                            const executorResult = await authenticationProcess.executor?.handler().then((res) => {
                                setAuthenticationFlows((prev) =>
                                    prev.map((item) => (item.connectorId === id ? { ...item, result: res } : item)),
                                );

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
                            this.__resolvers.resolve(executorResult || null);
                        } catch (error) {
                            this.__resolvers.reject(error);
                        } finally {
                            resetProcess(id);
                        }
                    },
                    async cancel() {
                        this.__resolvers.resolve(null);
                        setAuthenticationFlows((prev) => prev.filter((item) => item.connectorId !== id));
                        resetProcess(id);
                    },
                };
            }
            return null;
        },
        [authenticationFlows, resetProcess],
    );

    const createProcess = async (authorizationExecutor: Executor['handler'], name: string, id: string) => {
        const authenticationAwaiter = Promise.withResolvers<RefreshedAuthCredendentials | null>();

        setAuthenticationFlows((prev) => [
            ...prev,
            {
                executor: {
                    handler: authorizationExecutor,
                },
                authenticationResolvers: {
                    resolve: authenticationAwaiter.resolve,
                    reject: authenticationAwaiter.reject,
                },
                connectorName: name,
                connectorId: id,
                result: null,
            },
        ]);
        const promiseResult = await authenticationAwaiter.promise;
        return promiseResult;
    };

    return {
        authenticationFlows,
        createProcess,
        process,
    };
};

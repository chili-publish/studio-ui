import { RefreshedAuthCredendentials } from '@chili-publish/studio-sdk';
import { useCallback, useState } from 'react';
import { ConnectorAuthenticationResult } from '../../types/ConnectorAuthenticationResult';
import { ConnectorAuthResult } from './types';

interface Executor {
    handler: () => Promise<ConnectorAuthenticationResult>;
}

export type ConnectorPendingAuthentication = {
    connectorId: string;
    connectorName: string;
    authenticationResolvers: Omit<PromiseWithResolvers<RefreshedAuthCredendentials | null>, 'promise'> | null;
    executor: Executor | null;
};

export const useConnectorAuthentication = () => {
    const [pendingAuthentications, setPendingAuthentications] = useState<ConnectorPendingAuthentication[]>([]);
    const [authResults, setAuthResults] = useState<ConnectorAuthResult[]>([]);
    const resetProcess = useCallback((id: string) => {
        setPendingAuthentications((prev) => prev.filter((item) => item.connectorId !== id));
    }, []);

    const process = useCallback(
        (id: string) => {
            const authenticationProcess = pendingAuthentications.find((item) => item.connectorId === id);
            if (!authenticationProcess) return null;

            if (authenticationProcess.authenticationResolvers && authenticationProcess.executor) {
                return {
                    __resolvers: authenticationProcess.authenticationResolvers,
                    async start() {
                        try {
                            const executorResult = await authenticationProcess.executor?.handler().then((res) => {
                                setAuthResults((prev) => [
                                    ...prev,
                                    {
                                        result: res,
                                        connectorName: authenticationProcess.connectorName,
                                        connectorId: authenticationProcess.connectorId,
                                    },
                                ]);

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
                        resetProcess(id);
                    },
                };
            }
            return null;
        },
        [pendingAuthentications, resetProcess],
    );

    const createProcess = async (authorizationExecutor: Executor['handler'], name: string, id: string) => {
        const authenticationAwaiter = Promise.withResolvers<RefreshedAuthCredendentials | null>();

        setPendingAuthentications((prev) => [
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
            },
        ]);
        const promiseResult = await authenticationAwaiter.promise;
        return promiseResult;
    };

    return {
        authResults,
        pendingAuthentications,
        createProcess,
        process,
    };
};

import { RefreshedAuthCredendentials } from '@chili-publish/studio-sdk';
import { useCallback, useState } from 'react';
import { ConnectorAuthenticationResult } from '../../types/ConnectorAuthenticationResult';
import { ConnectorAuthResult } from './types';

interface Executor {
    handler: () => Promise<ConnectorAuthenticationResult>;
}

type AuthenticationResolvers = Omit<
    // eslint-disable-next-line no-undef
    PromiseWithResolvers<RefreshedAuthCredendentials | null>,
    'promise'
>;

interface ManualProcess {
    __resolvers: AuthenticationResolvers;
    start(): Promise<void>;
    cancel(): Promise<void>;
}

export interface CreateProcessFn {
    (
        executorOrResult: Executor['handler'] | ConnectorAuthenticationResult,
        name: string,
        remoteConnectorId: string,
    ): Promise<RefreshedAuthCredendentials | null>;
}

export type ConnectorPendingAuthentication = {
    remoteConnectorId: string;
    connectorName: string;
    authenticationResolvers: AuthenticationResolvers;
    executor: Executor | null;
};

export const useConnectorAuthentication = () => {
    const [pendingAuthentications, setPendingAuthentications] = useState<ConnectorPendingAuthentication[]>([]);
    const [authResults, setAuthResults] = useState<ConnectorAuthResult[]>([]);
    const resetProcess = useCallback((remoteConnectorId: string) => {
        setPendingAuthentications((prev) => prev.filter((item) => item.remoteConnectorId !== remoteConnectorId));
    }, []);

    const getProcess: (id: string) => ManualProcess | null = useCallback(
        (id: string) => {
            const authenticationProcess = pendingAuthentications.find((item) => item.remoteConnectorId === id);
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
                                        remoteConnectorId: authenticationProcess.remoteConnectorId,
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

    const createProcess: CreateProcessFn = async (executorOrResult, name: string, remoteConnectorId: string) => {
        const authenticationAwaiter = Promise.withResolvers<RefreshedAuthCredendentials | null>();

        if (typeof executorOrResult === 'function') {
            setPendingAuthentications((prev) => [
                ...prev,
                {
                    executor: {
                        handler: executorOrResult,
                    },
                    authenticationResolvers: {
                        resolve: authenticationAwaiter.resolve,
                        reject: authenticationAwaiter.reject,
                    },
                    connectorName: name,
                    remoteConnectorId,
                },
            ]);
            const promiseResult = await authenticationAwaiter.promise;
            return promiseResult;
        }
        setAuthResults((prev) => [
            ...prev,
            {
                result: executorOrResult,
                connectorName: name,
                remoteConnectorId,
            },
        ]);
        return null;
    };

    return {
        authResults,
        pendingAuthentications,
        createProcess,
        getProcess,
    };
};

import { RefreshedAuthCredendentials } from '@chili-publish/studio-sdk';
import { useCallback, useMemo, useState } from 'react';
import { ConnectorAuthenticationResult } from '../../types/ConnectorAuthenticationResult';

interface Executor {
    handler: () => Promise<ConnectorAuthenticationResult>;
}

export const useConnectorAuthentication = () => {
    const [authenticationResolvers, setAuthenticationResolvers] = useState<Omit<
        // eslint-disable-next-line no-undef
        PromiseWithResolvers<RefreshedAuthCredendentials | null>,
        'promise'
    > | null>(null);
    const [executor, setExecutor] = useState<Executor | null>(null);
    const [connectorName, setConnectorName] = useState<string>('');
    const [result, setResult] = useState<ConnectorAuthenticationResult | null>(null);

    const resetProcess = useCallback(() => {
        setAuthenticationResolvers(null);
        setExecutor(null);
    }, []);

    const process = useMemo(() => {
        if (authenticationResolvers && executor) {
            return {
                __resolvers: authenticationResolvers,
                async start() {
                    setResult(null);
                    try {
                        const executorResult = await executor.handler().then((res) => {
                            setResult(res);
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
                        resetProcess();
                    }
                },
                async cancel() {
                    this.__resolvers.resolve(null);
                    resetProcess();
                },
            };
        }
        return null;
    }, [authenticationResolvers, executor, resetProcess]);

    const createProcess = async (authorizationExecutor: Executor['handler'], name: string) => {
        const authenticationAwaiter = Promise.withResolvers<RefreshedAuthCredendentials | null>();
        setExecutor({
            handler: authorizationExecutor,
        });
        setAuthenticationResolvers({
            resolve: authenticationAwaiter.resolve,
            reject: authenticationAwaiter.reject,
        });
        setConnectorName(name);
        const promiseResult = await authenticationAwaiter.promise;
        return promiseResult;
    };

    return {
        createProcess,
        process,
        connectorName,
        result,
    };
};

import { RefreshedAuthCredendentials } from '@chili-publish/studio-sdk';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useConnectorAuthentication } from '../../../components/connector-authentication';

describe('useConnectorAuthentication hook', () => {
    beforeEach(() => {
        // eslint-disable-next-line  @typescript-eslint/no-empty-function
        jest.spyOn(window.console, 'warn').mockImplementation(() => {});
        // eslint-disable-next-line  @typescript-eslint/no-empty-function
        jest.spyOn(window.console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create with default values', () => {
        const { result } = renderHook(() => useConnectorAuthentication());
        expect(result.current.pendingAuthentications.length).toEqual(0);
    });

    it('should create "process" correctly', async () => {
        const executor = jest.fn();
        const { result } = renderHook(() => useConnectorAuthentication());

        act(() => {
            result.current.createProcess(executor, 'connectorName', 'connectorId');
        });

        await waitFor(() => result.current.pendingAuthentications[0].connectorName === 'connectorName');

        expect(result.current.getProcess('connectorId')).toEqual({
            __resolvers: {
                resolve: expect.any(Function),
                reject: expect.any(Function),
            },
            start: expect.any(Function),
            cancel: expect.any(Function),
        });
    });

    it('should perform process correclty for different connectors', async () => {
        const executor1 = jest.fn().mockResolvedValueOnce({ type: 'error' });
        const executor2 = jest.fn().mockResolvedValueOnce({ type: 'authenticated' });

        const { result } = renderHook(() => useConnectorAuthentication());

        let processResultConnector1: RefreshedAuthCredendentials | null | undefined;
        act(() => {
            result.current.createProcess(executor1, 'connectorName1', 'connectorId1').then(
                (res) => {
                    processResultConnector1 = res;
                },
                (err) => {
                    processResultConnector1 = err;
                },
            );
        });

        let processResultConnector2: RefreshedAuthCredendentials | null | undefined;
        act(() => {
            result.current.createProcess(executor2, 'connectorName2', 'connectorId2').then(
                (res) => {
                    processResultConnector2 = res;
                },
                (err) => {
                    processResultConnector2 = err;
                },
            );
        });

        await waitFor(() => result.current.pendingAuthentications[0].connectorName === 'connectorName1');
        await waitFor(() => result.current.pendingAuthentications[1].connectorName === 'connectorName2');

        await act(async () => {
            await result.current.getProcess('connectorId2')?.start();
        });

        await act(async () => {
            await result.current.getProcess('connectorId1')?.start();
        });

        expect(result.current.pendingAuthentications.length).toEqual(0);

        expect(processResultConnector1).toEqual(null);

        expect(processResultConnector2).toEqual(new RefreshedAuthCredendentials());
        await waitFor(() => {
            expect(result.current.authResults).toEqual(
                expect.arrayContaining([
                    {
                        connectorName: 'connectorName1',
                        remoteConnectorId: 'connectorId1',
                        result: { type: 'error' },
                    },
                    {
                        connectorName: 'connectorName2',
                        remoteConnectorId: 'connectorId2',
                        result: { type: 'authenticated' },
                    },
                ]),
            );
        });
    });

    it('should perform process correclty for none-authentified type', async () => {
        const executor = jest.fn().mockResolvedValueOnce({ type: 'authenticated' });
        const { result } = renderHook(() => useConnectorAuthentication());

        let processResult: RefreshedAuthCredendentials | null | undefined;
        act(() => {
            result.current.createProcess(executor, 'connectorName', 'connectorId').then(
                (res) => {
                    processResult = res;
                },
                (err) => {
                    processResult = err;
                },
            );
        });

        await waitFor(() => result.current.pendingAuthentications[0].connectorName === 'connectorName');

        await act(async () => {
            await result.current.getProcess('connectorId')?.start();
        });

        expect(processResult).toEqual(new RefreshedAuthCredendentials());
        expect(result.current.pendingAuthentications.length).toBe(0);
        await waitFor(() => {
            expect(result.current.authResults).toEqual(
                expect.arrayContaining([
                    {
                        connectorName: 'connectorName',
                        remoteConnectorId: 'connectorId',
                        result: { type: 'authenticated' },
                    },
                ]),
            );
        });
    });

    it('should perform process correclty when process return error state', async () => {
        const executor = jest.fn().mockResolvedValue({ type: 'error', error: '[Error]: Occured' });
        const { result } = renderHook(() => useConnectorAuthentication());

        let processResult: RefreshedAuthCredendentials | null | undefined;
        act(() => {
            result.current.createProcess(executor, 'connectorName', 'connectorId').then(
                (res) => {
                    processResult = res;
                },
                (err) => {
                    processResult = err;
                },
            );
        });

        await waitFor(() => result.current.pendingAuthentications[0].connectorName === 'connectorName');

        await act(async () => {
            await result.current.getProcess('connectorId')?.start();
        });

        expect(processResult).toEqual(null);
        expect(result.current.pendingAuthentications.length).toBe(0);
        expect(window.console.error).toHaveBeenCalledWith('[Error]: Occured');
        await waitFor(() => {
            expect(result.current.authResults).toEqual(
                expect.arrayContaining([
                    {
                        connectorName: 'connectorName',
                        remoteConnectorId: 'connectorId',
                        result: { type: 'error', error: '[Error]: Occured' },
                    },
                ]),
            );
        });
    });

    it('should perform process correclty when process return timeout', async () => {
        const executor = jest.fn().mockResolvedValue({ type: 'timeout' });
        const { result } = renderHook(() => useConnectorAuthentication());

        let processResult: RefreshedAuthCredendentials | null | undefined;
        act(() => {
            result.current.createProcess(executor, 'connectorName', 'connectorId').then(
                (res) => {
                    processResult = res;
                },
                (err) => {
                    processResult = err;
                },
            );
        });

        await waitFor(() => result.current.pendingAuthentications[0].connectorName === 'connectorName');

        await act(async () => {
            await result.current.getProcess('connectorId')?.start();
        });

        expect(processResult).toEqual(null);
        expect(result.current.pendingAuthentications.length).toBe(0);
        expect(window.console.error).not.toHaveBeenCalled();

        await waitFor(() => {
            expect(result.current.authResults).toEqual(
                expect.arrayContaining([
                    {
                        connectorName: 'connectorName',
                        remoteConnectorId: 'connectorId',
                        result: { type: 'timeout' },
                    },
                ]),
            );
        });
    });

    it('should perform process correclty when process rejected', async () => {
        const executor = jest.fn().mockRejectedValueOnce({ message: 'TestError' });
        const { result } = renderHook(() => useConnectorAuthentication());

        let processResult: RefreshedAuthCredendentials | null | undefined;
        act(() => {
            result.current.createProcess(executor, 'connectorName', 'connectorId').then(
                (res) => {
                    processResult = res;
                },
                (err) => {
                    processResult = err;
                },
            );
        });

        await waitFor(() => result.current.pendingAuthentications[0].connectorName === 'connectorName');

        await act(async () => {
            await result.current.getProcess('connectorId')?.start();
        });

        expect(processResult).toEqual({ message: 'TestError' });
        expect(result.current.pendingAuthentications.length).toBe(0);
    });

    it('should perform process correclty when canceling', async () => {
        const executor = jest.fn().mockRejectedValueOnce({ message: 'TestError' });
        const { result } = renderHook(() => useConnectorAuthentication());

        let processResult: RefreshedAuthCredendentials | null | undefined;
        act(() => {
            result.current.createProcess(executor, 'connectorName', 'connectorId').then(
                (res) => {
                    processResult = res;
                },
                (err) => {
                    processResult = err;
                },
            );
        });

        await waitFor(() => result.current.pendingAuthentications[0].connectorName === 'connectorName');

        await act(async () => {
            await result.current.getProcess('connectorId')?.cancel();
        });

        expect(executor).not.toHaveBeenCalled();
        expect(processResult).toEqual(null);
        expect(result.current.pendingAuthentications.length).toBe(0);
    });

    it('should handle direct ConnectorAuthenticationResult input without token', async () => {
        const { result } = renderHook(() => useConnectorAuthentication());
        const authResult = { type: 'authenticated' as const };

        let processResult: RefreshedAuthCredendentials | null | undefined;
        await act(async () => {
            processResult = await result.current.createProcess(authResult, 'connectorName', 'connectorId');
        });

        expect(processResult).toEqual(new RefreshedAuthCredendentials());
        await waitFor(() => {
            expect(result.current.authResults).toEqual([
                {
                    connectorName: 'connectorName',
                    remoteConnectorId: 'connectorId',
                    result: authResult,
                },
            ]);
        });

        expect(result.current.pendingAuthentications.length).toBe(0);
    });

    it('should handle direct ConnectorAuthenticationResult input with token', async () => {
        const { result } = renderHook(() => useConnectorAuthentication());
        const authResult = {
            type: 'authenticated' as const,
            token: {
                headerName: 'Authorization',
                headerValue: 'Bearer Token',
            },
        };

        let processResult: RefreshedAuthCredendentials | null | undefined;
        await act(async () => {
            processResult = await result.current.createProcess(authResult, 'connectorName', 'connectorId');
        });

        expect(processResult).toEqual(new RefreshedAuthCredendentials({ Authorization: 'Bearer Token' }));
        await waitFor(() => {
            expect(result.current.authResults).toEqual([
                {
                    connectorName: 'connectorName',
                    remoteConnectorId: 'connectorId',
                    result: authResult,
                },
            ]);
        });

        expect(result.current.pendingAuthentications.length).toBe(0);
    });

    it('should handle direct error ConnectorAuthenticationResult input', async () => {
        const { result } = renderHook(() => useConnectorAuthentication());
        const errorResult = { type: 'error' as const, error: new Error('Direct error') };

        let processResult: RefreshedAuthCredendentials | null | undefined;
        await act(async () => {
            processResult = await result.current.createProcess(errorResult, 'errorConnector', 'errorConnectorId');
        });

        expect(processResult).toEqual(null);
        expect(window.console.warn).toHaveBeenCalledWith('There is a "error" issue with authenticating the connector');
        expect(window.console.error).toHaveBeenCalledWith(errorResult.error);
        await waitFor(() => {
            expect(result.current.authResults).toEqual([
                {
                    connectorName: 'errorConnector',
                    remoteConnectorId: 'errorConnectorId',
                    result: errorResult,
                },
            ]);
        });
        expect(result.current.pendingAuthentications.length).toBe(0);
    });

    it('should reset process correctly', async () => {
        const { result } = renderHook(() => useConnectorAuthentication());
        const executor = jest.fn().mockResolvedValueOnce({ type: 'authenticated' });

        act(() => {
            result.current.createProcess(executor, 'connectorName', 'connectorId');
        });

        await waitFor(() => result.current.pendingAuthentications[0].connectorName === 'connectorName');
        expect(result.current.pendingAuthentications.length).toBe(1);

        await act(async () => {
            await result.current.getProcess('connectorId')?.cancel();
        });

        expect(result.current.pendingAuthentications.length).toBe(0);
    });
});

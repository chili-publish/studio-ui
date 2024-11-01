import { RefreshedAuthCredendentials } from '@chili-publish/studio-sdk';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
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
        expect(result.current.authenticationFlows.length).toEqual(0);
    });

    it('should create "process" correctly', async () => {
        const executor = jest.fn();
        const { result } = renderHook(() => useConnectorAuthentication());

        act(() => {
            result.current.createProcess(executor, 'connectorName', 'connectorId');
        });

        await waitFor(() => result.current.authenticationFlows[0].connectorName === 'connectorName');

        expect(result.current.process('connectorId')).toEqual({
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
        const executor2 = jest.fn().mockResolvedValueOnce({ type: 'authentified' });

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

        await waitFor(() => result.current.authenticationFlows[0].connectorName === 'connectorName1');
        await waitFor(() => result.current.authenticationFlows[1].connectorName === 'connectorName2');

        await act(async () => {
            await result.current.process?.('connectorId2')?.start();
        });

        await act(async () => {
            await result.current.process?.('connectorId1')?.start();
        });

        expect(result.current.authenticationFlows.length).toEqual(2);

        expect(processResultConnector1).toEqual(null);
        expect(result.current.authenticationFlows[0].authenticationResolvers).toBeNull();
        expect(result.current.authenticationFlows[0].executor).toBeNull();

        expect(result.current.authenticationFlows[1].result).toEqual({ type: 'authentified' });
        expect(processResultConnector2).toEqual(new RefreshedAuthCredendentials());
        expect(result.current.authenticationFlows[1].authenticationResolvers).toBeNull();
        expect(result.current.authenticationFlows[1].executor).toBeNull();
    });

    it('should perform process correclty for none-authentified type', async () => {
        const executor = jest.fn().mockResolvedValueOnce({ type: 'authentified' });
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

        await waitFor(() => result.current.authenticationFlows[0].connectorName === 'connectorName');

        await act(async () => {
            await result.current.process?.('connectorId')?.start();
        });

        expect(result.current.authenticationFlows.length).toEqual(1);
        expect(result.current.authenticationFlows[0].result).toEqual({ type: 'authentified' });
        expect(processResult).toEqual(new RefreshedAuthCredendentials());
        expect(result.current.authenticationFlows[0].authenticationResolvers).toBeNull();
        expect(result.current.authenticationFlows[0].executor).toBeNull();
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

        await waitFor(() => result.current.authenticationFlows[0].connectorName === 'connectorName');

        await act(async () => {
            await result.current.process?.('connectorId')?.start();
        });

        expect(processResult).toEqual(null);
        expect(result.current.authenticationFlows[0].result).toEqual({ type: 'error', error: '[Error]: Occured' });
        expect(result.current.authenticationFlows[0].authenticationResolvers).toBeNull();
        expect(result.current.authenticationFlows[0].executor).toBeNull();
        expect(window.console.error).toHaveBeenCalledWith('[Error]: Occured');
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

        await waitFor(() => result.current.authenticationFlows[0].connectorName === 'connectorName');

        await act(async () => {
            await result.current.process?.('connectorId')?.start();
        });

        expect(processResult).toEqual(null);
        expect(result.current.authenticationFlows[0].result).toEqual({ type: 'timeout' });
        expect(result.current.authenticationFlows[0].authenticationResolvers).toBeNull();
        expect(result.current.authenticationFlows[0].executor).toBeNull();
        expect(window.console.error).not.toHaveBeenCalled();
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

        await waitFor(() => result.current.authenticationFlows[0].connectorName === 'connectorName');

        await act(async () => {
            await result.current.process?.('connectorId')?.start();
        });

        expect(processResult).toEqual({ message: 'TestError' });
        expect(result.current.authenticationFlows[0].result).toBeNull();
        expect(result.current.authenticationFlows[0].authenticationResolvers).toBeNull();
        expect(result.current.authenticationFlows[0].executor).toBeNull();
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

        await waitFor(() => result.current.authenticationFlows[0].connectorName === 'connectorName');

        await act(async () => {
            await result.current.process?.('connectorId')?.cancel();
        });

        expect(executor).not.toHaveBeenCalled();
        expect(processResult).toEqual(null);
        expect(result.current.authenticationFlows.length).toBe(0);
    });
});

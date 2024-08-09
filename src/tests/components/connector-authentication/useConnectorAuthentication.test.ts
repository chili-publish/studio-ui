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
        expect(result.current.connectorName).toEqual('');
        expect(result.current.process).toBeNull();
    });

    it('should create "process" correctly', async () => {
        const executor = jest.fn();
        const { result } = renderHook(() => useConnectorAuthentication());

        act(() => {
            result.current.createProcess(executor, 'connectorName');
        });

        await waitFor(() => result.current.connectorName === 'connectorName');

        expect(result.current.process).toEqual({
            __resolvers: {
                resolve: expect.any(Function),
                reject: expect.any(Function),
            },
            start: expect.any(Function),
            cancel: expect.any(Function),
        });
    });

    it('should perform process correclty for none-authentified type', async () => {
        const executor = jest.fn().mockResolvedValueOnce({ type: 'error' });
        const { result } = renderHook(() => useConnectorAuthentication());

        let processResult: RefreshedAuthCredendentials | null | undefined;
        act(() => {
            result.current.createProcess(executor, 'connectorName').then(
                (res) => {
                    processResult = res;
                },
                (err) => {
                    processResult = err;
                },
            );
        });

        await waitFor(() => result.current.connectorName === 'connectorName');

        await act(async () => {
            await result.current.process?.start();
        });

        expect(processResult).toEqual(null);
        expect(result.current.process).toBeNull();
    });

    it('should perform process correclty for authentified type', async () => {
        const executor = jest.fn().mockResolvedValueOnce({ type: 'authentified' });
        const { result } = renderHook(() => useConnectorAuthentication());

        let processResult: RefreshedAuthCredendentials | null | undefined;
        act(() => {
            result.current.createProcess(executor, 'connectorName').then(
                (res) => {
                    processResult = res;
                },
                (err) => {
                    processResult = err;
                },
            );
        });

        await waitFor(() => result.current.connectorName === 'connectorName');

        await act(async () => {
            await result.current.process?.start();
        });

        expect(processResult).toEqual(new RefreshedAuthCredendentials());
        expect(result.current.result).toEqual({ type: 'authentified' });
        expect(result.current.process).toBeNull();
    });

    it('should perform process correclty when process return error state', async () => {
        const executor = jest.fn().mockResolvedValue({ type: 'error', error: '[Error]: Occured' });
        const { result } = renderHook(() => useConnectorAuthentication());

        let processResult: RefreshedAuthCredendentials | null | undefined;
        act(() => {
            result.current.createProcess(executor, 'connectorName').then(
                (res) => {
                    processResult = res;
                },
                (err) => {
                    processResult = err;
                },
            );
        });

        await waitFor(() => result.current.connectorName === 'connectorName');

        await act(async () => {
            await result.current.process?.start();
        });

        expect(processResult).toEqual(null);
        expect(result.current.result).toEqual({ type: 'error', error: '[Error]: Occured' });
        expect(window.console.error).toHaveBeenCalledWith('[Error]: Occured');
        expect(result.current.process).toBeNull();
    });

    it('should perform process correclty when process return timeout', async () => {
        const executor = jest.fn().mockResolvedValue({ type: 'timeout' });
        const { result } = renderHook(() => useConnectorAuthentication());

        let processResult: RefreshedAuthCredendentials | null | undefined;
        act(() => {
            result.current.createProcess(executor, 'connectorName').then(
                (res) => {
                    processResult = res;
                },
                (err) => {
                    processResult = err;
                },
            );
        });

        await waitFor(() => result.current.connectorName === 'connectorName');

        await act(async () => {
            await result.current.process?.start();
        });

        expect(processResult).toEqual(null);
        expect(result.current.result).toEqual({ type: 'timeout' });
        expect(window.console.error).not.toHaveBeenCalled();
        expect(result.current.process).toBeNull();
    });

    it('should perform process correclty when process rejected', async () => {
        const executor = jest.fn().mockRejectedValueOnce({ message: 'TestError' });
        const { result } = renderHook(() => useConnectorAuthentication());

        let processResult: RefreshedAuthCredendentials | null | undefined;
        act(() => {
            result.current.createProcess(executor, 'connectorName').then(
                (res) => {
                    processResult = res;
                },
                (err) => {
                    processResult = err;
                },
            );
        });

        await waitFor(() => result.current.connectorName === 'connectorName');

        await act(async () => {
            await result.current.process?.start();
        });

        expect(processResult).toEqual({ message: 'TestError' });
        expect(result.current.result).toBeNull();
        expect(result.current.process).toBeNull();
    });

    it('should perform process correclty when canceling', async () => {
        const executor = jest.fn().mockRejectedValueOnce({ message: 'TestError' });
        const { result } = renderHook(() => useConnectorAuthentication());

        let processResult: RefreshedAuthCredendentials | null | undefined;
        act(() => {
            result.current.createProcess(executor, 'connectorName').then(
                (res) => {
                    processResult = res;
                },
                (err) => {
                    processResult = err;
                },
            );
        });

        await waitFor(() => result.current.connectorName === 'connectorName');

        await act(async () => {
            await result.current.process?.cancel();
        });

        expect(executor).not.toHaveBeenCalled();
        expect(processResult).toEqual(null);
        expect(result.current.process).toBeNull();
    });
});

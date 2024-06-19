import { renderHook, waitFor } from '@testing-library/react';
import { Variable } from '@chili-publish/studio-sdk';
import { act } from 'react-dom/test-utils';
import { useVariablesChange } from '../../../core/hooks/useVariablesChange';
import { Subscriber } from '../../../utils/subscriber';
import { useSubscriberContext } from '../../../contexts/Subscriber';

jest.mock('../../../contexts/Subscriber', () => ({
    useSubscriberContext: jest.fn().mockReturnValue({
        subscriber: null,
    }),
}));

describe('"useVariablesChange" hook', () => {
    beforeEach(() => {
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: new Subscriber(),
        });
        window.SDK.variable.getAll = jest.fn().mockResolvedValue({
            parsedData: [
                {
                    id: '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2',
                },
                {
                    id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E',
                },
            ],
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should not update variables if variableIds are empty', async () => {
        const { result } = renderHook(() => useVariablesChange([]));

        await waitFor(() => expect(window.SDK.variable.getAll).toHaveBeenCalled());

        expect(result.current.currentVariables).toEqual({});
    });

    it('should not update variables if variables are null', async () => {
        window.SDK.variable.getAll = jest.fn().mockResolvedValueOnce({
            parsedData: null,
        });
        const { result } = renderHook(() => useVariablesChange(['7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2']));

        await waitFor(() => expect(window.SDK.variable.getAll).toHaveBeenCalled());

        expect(result.current.currentVariables).toEqual({});
    });

    it('should "warn" for edge case', async () => {
        jest.spyOn(window.console, 'warn');
        const { result } = renderHook(() => useVariablesChange(['1377E97A-5FD9-46B1-A8CF-0C7C776C7DC2']));

        await waitFor(() => expect(window.SDK.variable.getAll).toHaveBeenCalled());

        expect(window.console.warn).toHaveBeenCalledWith('Variables list is not loaded properly');
        expect(result.current.currentVariables).toEqual({});
    });

    it('should set variables to listen', async () => {
        jest.spyOn(window.console, 'warn');
        const { result } = renderHook(() => useVariablesChange(['7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2']));

        await waitFor(() => expect(window.SDK.variable.getAll).toHaveBeenCalled());

        expect(window.console.warn).not.toHaveBeenCalledWith('Variables list is not loaded properly');
        expect(result.current.currentVariables).toEqual({
            '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2': {
                id: '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2',
            },
        });
    });

    it('should not apply change for variables not in the list when emit', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });

        jest.spyOn(window.console, 'warn');
        const { result } = renderHook(() =>
            useVariablesChange(['7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2', '8A59BB89-898D-4BAC-9C8F-F40F6C83479E']),
        );

        await waitFor(() => expect(window.SDK.variable.getAll).toHaveBeenCalled());

        expect(window.console.warn).not.toHaveBeenCalledWith('Variables list is not loaded properly');
        const current = result.current.currentVariables;
        expect(result.current.currentVariables).toEqual({
            '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2': {
                id: '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2',
            },
            '8A59BB89-898D-4BAC-9C8F-F40F6C83479E': {
                id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E',
            },
        });

        mockSubscriber.emit('onVariableListChanged', [
            {
                id: '1234',
            } as unknown as Variable,
        ]);

        expect(current === result.current.currentVariables).toEqual(true);
    });

    it('should not apply change for variables if there are no changes when emit', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });

        jest.spyOn(window.console, 'warn');
        const { result } = renderHook(() =>
            useVariablesChange(['7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2', '8A59BB89-898D-4BAC-9C8F-F40F6C83479E']),
        );

        await waitFor(() => expect(window.SDK.variable.getAll).toHaveBeenCalled());

        expect(window.console.warn).not.toHaveBeenCalledWith('Variables list is not loaded properly');
        const current = result.current.currentVariables;
        expect(result.current.currentVariables).toEqual({
            '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2': {
                id: '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2',
            },
            '8A59BB89-898D-4BAC-9C8F-F40F6C83479E': {
                id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E',
            },
        });

        mockSubscriber.emit('onVariableListChanged', [
            {
                id: '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2',
            } as unknown as Variable,
        ]);

        expect(current === result.current.currentVariables).toEqual(true);
    });

    it('should apply changes for all changed variables when emit', async () => {
        const mockSubscriber = new Subscriber();
        (useSubscriberContext as jest.Mock).mockReturnValue({
            subscriber: mockSubscriber,
        });

        jest.spyOn(window.console, 'warn');
        const { result } = renderHook(() =>
            useVariablesChange(['7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2', '8A59BB89-898D-4BAC-9C8F-F40F6C83479E']),
        );

        await waitFor(() => expect(window.SDK.variable.getAll).toHaveBeenCalled());

        expect(window.console.warn).not.toHaveBeenCalledWith('Variables list is not loaded properly');
        expect(result.current.currentVariables).toEqual({
            '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2': {
                id: '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2',
            },
            '8A59BB89-898D-4BAC-9C8F-F40F6C83479E': {
                id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E',
            },
        });

        act(() => {
            mockSubscriber.emit('onVariableListChanged', [
                {
                    id: '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2',
                    value: '1234',
                } as unknown as Variable,
                {
                    id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E',
                    value: '333',
                } as unknown as Variable,
            ]);
        });

        expect(result.current.currentVariables).toEqual({
            '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2': {
                id: '7377E97A-5FD9-46B1-A8CF-0C7C776C7DC2',
                value: '1234',
            },
            '8A59BB89-898D-4BAC-9C8F-F40F6C83479E': {
                id: '8A59BB89-898D-4BAC-9C8F-F40F6C83479E',
                value: '333',
            },
        });
    });
});

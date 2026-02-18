import { act, waitFor, renderHook } from '@testing-library/react';
import { useProcessingQueue } from '../../utils/useQueue';

describe('useProcessingQueue', () => {
    let mockProcessItem: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        mockProcessItem = jest.fn().mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should process items when scheduleProcessing is called', async () => {
        const { result } = renderHook(() =>
            useProcessingQueue({
                processItem: mockProcessItem,
            }),
        );

        act(() => {
            result.current.addToQueue('item1');
            result.current.addToQueue('item2');
            result.current.scheduleProcessing();
        });

        act(() => {
            jest.advanceTimersByTime(100);
        });

        await waitFor(() => {
            expect(mockProcessItem).toHaveBeenCalledWith('item1');
            expect(mockProcessItem).toHaveBeenCalledWith('item2');
        });
    });

    it('should handle processing errors gracefully', async () => {
        const error = new Error('Processing failed');
        const errorProcessItem = jest.fn().mockRejectedValue(error);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() =>
            useProcessingQueue({
                processItem: errorProcessItem,
            }),
        );

        act(() => {
            result.current.addToQueue('item1');
            result.current.scheduleProcessing();
        });

        act(() => {
            jest.advanceTimersByTime(100);
        });

        await waitFor(() => {
            expect(errorProcessItem).toHaveBeenCalledWith('item1');
            expect(consoleSpy).toHaveBeenCalledWith('Error processing item:', error);
        });

        consoleSpy.mockRestore();
    });

    it('should not process duplicate items', async () => {
        const { result } = renderHook(() =>
            useProcessingQueue({
                processItem: mockProcessItem,
            }),
        );

        act(() => {
            result.current.addToQueue('item1');
            result.current.addToQueue('item1'); // Duplicate
            result.current.addToQueue('item2');
            result.current.scheduleProcessing();
        });

        act(() => {
            jest.advanceTimersByTime(100);
        });

        await waitFor(() => {
            expect(mockProcessItem).toHaveBeenCalledTimes(2);
            expect(mockProcessItem).toHaveBeenCalledWith('item1');
            expect(mockProcessItem).toHaveBeenCalledWith('item2');
        });
    });

    it('should process items in order', async () => {
        const processOrder: string[] = [];
        const orderedProcessItem = jest.fn().mockImplementation((item: string) => {
            processOrder.push(item);
            return Promise.resolve();
        });

        const { result } = renderHook(() =>
            useProcessingQueue({
                processItem: orderedProcessItem,
            }),
        );

        act(() => {
            result.current.addToQueue('item1');
            result.current.addToQueue('item2');
            result.current.addToQueue('item3');
            result.current.scheduleProcessing();
        });

        act(() => {
            jest.advanceTimersByTime(100);
        });

        await waitFor(() => {
            expect(processOrder).toEqual(['item1', 'item2', 'item3']);
        });
    });
});

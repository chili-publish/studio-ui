import { useCallback, useRef, useState } from 'react';
import { useRefDebouncedCallback } from '@chili-publish/grafx-shared-components';

export type QueueStatus = 'idle' | 'processing';

export interface UseQueueOptions<T> {
    /**
     * Function to process a single item from the queue
     */
    processItem: (item: T) => Promise<void>;
    /**
     * Delay before processing starts (in milliseconds)
     * @default 100
     */
    processingDelay?: number;
}

export interface UseQueueReturn<T> {
    /**
     * Add an item to the queue
     */
    addToQueue: (item: T) => void;
    /**
     * Manually schedule processing (useful for testing)
     */
    scheduleProcessing: () => void;
}

export const useProcessingQueue = function <T>(options: UseQueueOptions<T>): UseQueueReturn<T> {
    const { processItem, processingDelay = 100 } = options;

    // Queue for items - unique by item identity
    const queueRef = useRef<Set<T>>(new Set());
    // Queue processing status
    const [queueStatus, setQueueStatus] = useState<QueueStatus>('idle');

    const processQueue = useCallback(async () => {
        setQueueStatus('processing');

        const iterator = queueRef.current.values();
        let result = iterator.next();

        while (!result.done) {
            const item = result.value;

            // Remove item from queue BEFORE processing to prevent outdated processing
            queueRef.current.delete(item);

            try {
                // eslint-disable-next-line no-await-in-loop
                await processItem(item);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error processing item:', error);
            }

            result = iterator.next();
        }

        setQueueStatus('idle');
    }, [processItem]);

    const debouncedProcessQueue = useRefDebouncedCallback(processQueue, processingDelay);

    const scheduleProcessing = useCallback(() => {
        if (queueStatus === 'processing') {
            return;
        }
        debouncedProcessQueue();
    }, [queueStatus, debouncedProcessQueue]);

    const addToQueue = useCallback((item: T) => {
        queueRef.current.add(item);
    }, []);

    return {
        addToQueue,
        scheduleProcessing,
    };
};

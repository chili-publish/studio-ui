import { useCallback, useEffect, useRef, useState } from 'react';
import { Id, Page } from '@chili-publish/studio-sdk';
import { useDebounce } from '@chili-publish/grafx-shared-components';
import { PageSnapshot } from '../../types/types';
import { useProcessingQueue } from '../../utils/useQueue';

export const usePageSnapshots = (pages: Page[]) => {
    // Use only ref for internal state management
    const pageSnapshotsRef = useRef<Map<Id, PageSnapshot>>(new Map());

    // State only for external consumption - derived from ref
    const [pageSnapshotsArray, setPageSnapshotsArray] = useState<PageSnapshot[]>([]);
    /**
     * We use a number (counter) for updateTrigger instead of a boolean or timestamp because:
     * - Incrementing a number always produces a new value, ensuring React always triggers a re-render and effect.
     * - Boolean toggles can miss updates if toggled rapidly (React may batch and skip some updates).
     * - Timestamps (Date.now()) can repeat if updates happen within the same millisecond, causing missed updates.
     * The counter approach is the most robust and React-friendly solution for async/rapid updates.
     */
    const [updateTrigger, setUpdateTrigger] = useState(0);

    const updatePageSnapshot = useCallback(async (pageId: Id) => {
        const newSnapshot = await window.StudioUISDK.page.getSnapshot(pageId);

        pageSnapshotsRef.current.set(pageId, {
            id: pageId,
            snapshot: newSnapshot,
        });

        // Trigger re-render to update the snapshots array
        setUpdateTrigger((prev) => prev + 1);
    }, []);

    const { addToQueue, scheduleProcessing } = useProcessingQueue<Id>({
        processItem: updatePageSnapshot,
        processingDelay: 100,
    });

    const processPages = useCallback(
        (existingPages: Page[]) => {
            const pagesNeedingSnapshots = existingPages.filter((page) => !pageSnapshotsRef.current.has(page.id));
            if (pagesNeedingSnapshots.length > 0) {
                pagesNeedingSnapshots.forEach((page) => {
                    addToQueue(page.id);
                });
                scheduleProcessing();
            }
        },
        [addToQueue, scheduleProcessing],
    );

    const debouncedProcessPages = useDebounce(processPages, 50);

    useEffect(() => {
        const unsubscribe = window.StudioUISDK.config.events.onPageSnapshotInvalidated.registerCallback(
            (pageId: Id) => {
                addToQueue(pageId);
                scheduleProcessing();
            },
        );
        return () => {
            unsubscribe();
        };
    }, [addToQueue, scheduleProcessing]);

    // Process pages when pages prop changes
    useEffect(() => {
        debouncedProcessPages(pages);
    }, [pages, debouncedProcessPages]);

    // Update external snapshots array in case there is a change in internal state or pages property
    useEffect(() => {
        const newArray = pages
            .map((page) => pageSnapshotsRef.current.get(page.id))
            .filter((s): s is PageSnapshot => !!s);

        // Check if the array content actually changed (IDs or snapshot references)
        const hasChanged = (() => {
            // Check if number of snapshots changed: Checks removal or adding of pages
            if (pageSnapshotsArray.length !== newArray.length) {
                return true;
            }

            // Check re-ordering or snapshot reference changed
            return newArray.some((newSnapshot, index) => {
                const current = pageSnapshotsArray[index];

                // Check if ID changed: Checks re-ordering of snapshots
                if (!current || current.id !== newSnapshot.id) {
                    return true;
                }

                // Check if snapshot reference changed (new snapshot was created)
                return current.snapshot !== newSnapshot.snapshot;
            });
        })();

        if (hasChanged) {
            setPageSnapshotsArray(newArray);
        }
    }, [pages, updateTrigger, pageSnapshotsArray]);

    return {
        pageSnapshots: pageSnapshotsArray,
    };
};

import { waitFor } from '@testing-library/react';
import EditorSDK, { ConfigType, Page } from '@chili-publish/studio-sdk';
import { usePageSnapshots } from '../../../components/pagesPanel/usePageSnapshots';
import { renderHookWithProviders } from '../../mocks/Provider';
import { useProcessingQueue } from '../../../utils/useQueue';

// Mock the studio-sdk module
jest.mock('@chili-publish/studio-sdk', () => {
    const originalModule = jest.requireActual('@chili-publish/studio-sdk');

    return {
        __esModule: true,
        ...originalModule,
        /* eslint-disable */
        default: function (config: ConfigType) {
            const sdk = new originalModule.default(config);
            /* eslint-enable */
            return {
                ...sdk,
                page: {
                    getSnapshot: jest.fn((pageId?: string) =>
                        Promise.resolve(new Uint8Array(Buffer.from(`snapshot${pageId || 'default'}`))),
                    ),
                },
            };
        },
    };
});

// Mock the queue utility
jest.mock('../../../utils/useQueue', () => ({
    useProcessingQueue: jest.fn(),
}));

const mockPages: Page[] = [
    { id: 'page1', number: 1, isVisible: true, width: 100, height: 100 },
    { id: 'page2', number: 2, isVisible: true, width: 100, height: 100 },
    { id: 'page3', number: 3, isVisible: true, width: 100, height: 100 },
];

describe('usePageSnapshots', () => {
    let mockAddToQueue: jest.Mock;
    let mockScheduleProcessing: jest.Mock;

    beforeEach(() => {
        // Create the mock SDK instance
        const mockSdk = new EditorSDK({
            editorId: 'test-editor',
            editorLink: 'test-url',
            enableNextSubscribers: {
                onVariableListChanged: true,
            },
        });

        window.StudioUISDK = mockSdk;

        mockAddToQueue = jest.fn();
        mockScheduleProcessing = jest.fn();

        (useProcessingQueue as jest.Mock).mockReturnValue({
            addToQueue: mockAddToQueue,
            scheduleProcessing: mockScheduleProcessing,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with empty pageSnapshots array', () => {
        const { result } = renderHookWithProviders(() => usePageSnapshots(mockPages));
        expect(result.current.pageSnapshots).toEqual([]);
    });

    it('should set up queue processing for pages that need snapshots', async () => {
        renderHookWithProviders(() => usePageSnapshots(mockPages));

        // Wait for the debounced processing to complete
        await waitFor(() => {
            expect(mockAddToQueue).toHaveBeenCalledWith('page1');
            expect(mockAddToQueue).toHaveBeenCalledWith('page2');
            expect(mockAddToQueue).toHaveBeenCalledWith('page3');
            expect(mockScheduleProcessing).toHaveBeenCalled();
        });
    });

    it('should handle page snapshot invalidation events', async () => {
        renderHookWithProviders(() => usePageSnapshots(mockPages));

        // Trigger the event
        window.StudioUISDK.config.events.onPageSnapshotInvalidated.trigger('page1');

        // Verify the callback adds the page to queue
        expect(mockAddToQueue).toHaveBeenCalledWith('page1');
        expect(mockScheduleProcessing).toHaveBeenCalled();
    });

    it('should handle errors in snapshot processing gracefully', async () => {
        // Mock the SDK to throw an error
        window.StudioUISDK.page.getSnapshot = jest.fn().mockRejectedValue(new Error('Snapshot failed'));

        const { result } = renderHookWithProviders(() => usePageSnapshots(mockPages.slice(0, 1)));

        // Wait for initial setup
        await waitFor(() => {
            expect(mockAddToQueue).toHaveBeenCalledWith('page1');
        });

        // The hook should not crash and should still return an empty array
        // since the snapshot processing failed
        expect(result.current.pageSnapshots).toEqual([]);
    });

    it('should handle empty pages array', () => {
        const { result } = renderHookWithProviders(() => usePageSnapshots([]));
        expect(result.current.pageSnapshots).toEqual([]);
        expect(mockAddToQueue).not.toHaveBeenCalled();
        expect(mockScheduleProcessing).not.toHaveBeenCalled();
    });
});

import SDK, { FrameLayoutType, FrameConstraints, FrameTypeEnum, FrameType } from '@chili-publish/studio-sdk';
import { act, waitFor } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import { renderHookWithProviders } from '@tests/mocks/Provider';
import { useDocumentTools } from '../../hooks/useDocumentTools';
import { defaultStudioOptions } from 'src/utils/studioOptions.util';

const createMockPropertyState = <T>(value: T) => ({
    value,
    isOverride: false,
    isReadOnly: false,
});

const createMockFrame = (id: string, name: string) =>
    ({
        id,
        name,
        type: FrameTypeEnum.text,
    }) as unknown as FrameType;

const createMockFrameLayout = (id: string, isVisible: boolean): NonNullable<FrameLayoutType> =>
    ({
        id,
        isVisible: createMockPropertyState(isVisible),
    }) as unknown as NonNullable<FrameLayoutType>;

const createMockConstraints = (overrides?: Partial<FrameConstraints>): FrameConstraints =>
    ({
        selectionAllowed: createMockPropertyState(false),
        ...overrides,
    }) as unknown as FrameConstraints;

describe('useDocumentTools', () => {
    let sdk: SDK;
    let getAllByPageIdSpy: jest.Mock;
    let getConstraintsSpy: jest.Mock;
    let setSelectSpy: jest.Mock;
    let setHandSpy: jest.Mock;
    let deselectAllSpy: jest.Mock;
    let getSelectedFramesSpy: jest.Mock;
    let updateStudioOptionsSpy: jest.Mock;
    let triggerCallback: (framesLayout: FrameLayoutType[]) => void;

    beforeEach(() => {
        // Create a mocked SDK instance
        sdk = mock<SDK>();

        // Set up frame methods
        getAllByPageIdSpy = jest.fn();
        deselectAllSpy = jest.fn();
        getSelectedFramesSpy = jest.fn().mockResolvedValue({
            success: true,
            status: 200,
            parsedData: [],
        });
        sdk.frame = {
            getAllByPageId: getAllByPageIdSpy,
            deselectAll: deselectAllSpy,
            getSelected: getSelectedFramesSpy,
            constraints: {
                get: jest.fn(),
            },
        } as unknown as typeof sdk.frame;
        getConstraintsSpy = sdk.frame.constraints.get as jest.Mock;

        // Set up tool methods
        setSelectSpy = jest.fn();
        sdk.tool = {
            setSelect: setSelectSpy,
            setHand: jest.fn(),
        } as unknown as typeof sdk.tool;
        setHandSpy = sdk.tool.setHand as jest.Mock;

        sdk.configuration = {
            updateStudioOptions: jest.fn(),
        } as unknown as typeof sdk.configuration;
        updateStudioOptionsSpy = sdk.configuration.updateStudioOptions as jest.Mock;

        // Set up event system
        triggerCallback = jest.fn() as (framesLayout: FrameLayoutType[]) => void;
        sdk.config = {
            events: {
                onFramesLayoutChanged: {
                    registerCallback: jest.fn((callback) => {
                        triggerCallback = callback as (framesLayout: FrameLayoutType[]) => void;
                        return jest.fn();
                    }),
                },
            },
        } as unknown as typeof sdk.config;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should set hand tool when no frames have enabled constraints', async () => {
        const frame1 = createMockFrame('frame1', 'Frame 1');
        const frame2 = createMockFrame('frame2', 'Frame 2');

        getAllByPageIdSpy.mockResolvedValue({
            success: true,
            status: 200,
            parsedData: [frame1, frame2],
        });

        getConstraintsSpy
            .mockResolvedValueOnce({
                success: true,
                status: 200,
                parsedData: createMockConstraints({
                    selectionAllowed: createMockPropertyState(false),
                }),
            })
            .mockResolvedValueOnce({
                success: true,
                status: 200,
                parsedData: createMockConstraints({
                    selectionAllowed: createMockPropertyState(false),
                }),
            });

        renderHookWithProviders(() => useDocumentTools(sdk, 'page1'));

        // Clear initial calls from hook mount
        jest.clearAllMocks();

        getSelectedFramesSpy.mockResolvedValue({
            success: true,
            status: 200,
            parsedData: [frame1],
        });

        // Simulate frames layout change with visible frames
        await act(async () => {
            await triggerCallback([createMockFrameLayout('frame1', true), createMockFrameLayout('frame2', true)]);
        });

        await waitFor(() => {
            expect(getAllByPageIdSpy).toHaveBeenCalledWith('page1');
            expect(getConstraintsSpy).toHaveBeenCalledTimes(2);
            expect(getSelectedFramesSpy).toHaveBeenCalled();
            expect(deselectAllSpy).toHaveBeenCalled();
            expect(setHandSpy).toHaveBeenCalled();
            expect(setSelectSpy).not.toHaveBeenCalled();
            expect(updateStudioOptionsSpy).toHaveBeenCalledWith(defaultStudioOptions);
        });
    });

    it('should set hand tool without deselecting when no frames are selected', async () => {
        const frame1 = createMockFrame('frame1', 'Frame 1');

        getAllByPageIdSpy.mockResolvedValue({
            success: true,
            status: 200,
            parsedData: [frame1],
        });

        getConstraintsSpy.mockResolvedValue({
            success: true,
            status: 200,
            parsedData: createMockConstraints({
                selectionAllowed: createMockPropertyState(false),
            }),
        });

        renderHookWithProviders(() => useDocumentTools(sdk, 'page1'));

        // Clear initial calls from hook mount
        jest.clearAllMocks();

        getSelectedFramesSpy.mockResolvedValue({
            success: true,
            status: 200,
            parsedData: [],
        });

        await act(async () => {
            await triggerCallback([createMockFrameLayout('frame1', true)]);
        });

        await waitFor(() => {
            expect(getAllByPageIdSpy).toHaveBeenCalledWith('page1');
            expect(getConstraintsSpy).toHaveBeenCalledTimes(1);
            expect(getSelectedFramesSpy).toHaveBeenCalled();
            expect(deselectAllSpy).not.toHaveBeenCalled();
            expect(setHandSpy).toHaveBeenCalled();
            expect(setSelectSpy).not.toHaveBeenCalled();
            expect(updateStudioOptionsSpy).toHaveBeenCalledWith(defaultStudioOptions);
        });
    });

    it('should only process visible frames when frames layout changes', async () => {
        const frame1 = createMockFrame('frame1', 'Frame 1');
        const frame2 = createMockFrame('frame2', 'Frame 2');
        const frame3 = createMockFrame('frame3', 'Frame 3');

        getAllByPageIdSpy.mockResolvedValue({
            success: true,
            status: 200,
            parsedData: [frame1, frame2, frame3],
        });

        getConstraintsSpy.mockResolvedValue({
            success: true,
            status: 200,
            parsedData: createMockConstraints({
                selectionAllowed: createMockPropertyState(true),
            }),
        });

        renderHookWithProviders(() => useDocumentTools(sdk, 'page1'));

        // Clear initial calls from hook mount
        jest.clearAllMocks();

        // Simulate frames layout change with only frame1 and frame2 visible
        await act(async () => {
            await triggerCallback([
                createMockFrameLayout('frame1', true),
                createMockFrameLayout('frame2', true),
                createMockFrameLayout('frame3', false),
            ]);
        });

        await waitFor(() => {
            expect(getAllByPageIdSpy).toHaveBeenCalledWith('page1');
            // Should only get constraints for visible frames (frame1 and frame2)
            expect(getConstraintsSpy).toHaveBeenCalledTimes(2);
            expect(getConstraintsSpy).toHaveBeenCalledWith('frame1');
            expect(getConstraintsSpy).toHaveBeenCalledWith('frame2');
            expect(getConstraintsSpy).not.toHaveBeenCalledWith('frame3');
            expect(updateStudioOptionsSpy).toHaveBeenCalledWith(defaultStudioOptions);
        });
    });

    it('should handle frames layout change event and update visible frames', async () => {
        const frame1 = createMockFrame('frame1', 'Frame 1');

        getAllByPageIdSpy.mockResolvedValue({
            success: true,
            status: 200,
            parsedData: [frame1],
        });

        getConstraintsSpy.mockResolvedValue({
            success: true,
            status: 200,
            parsedData: createMockConstraints({
                selectionAllowed: createMockPropertyState(true),
            }),
        });

        renderHookWithProviders(() => useDocumentTools(sdk, 'page1'));

        // Clear initial calls from hook mount
        jest.clearAllMocks();

        // First frames layout change
        await act(async () => {
            await triggerCallback([createMockFrameLayout('frame1', true)]);
        });

        await waitFor(() => {
            expect(getAllByPageIdSpy).toHaveBeenCalledTimes(1);
        });

        // Second frames layout change
        await act(async () => {
            await triggerCallback([createMockFrameLayout('frame1', true), createMockFrameLayout('frame2', true)]);
        });

        await waitFor(() => {
            expect(getAllByPageIdSpy).toHaveBeenCalledTimes(2);
        });
        await waitFor(() => {
            expect(updateStudioOptionsSpy).toHaveBeenCalledWith({
                ...defaultStudioOptions,
                shortcutOptions: { ...defaultStudioOptions.shortcutOptions, hand: { enabled: false } },
            });
        });
    });

    it('should handle when selectedPageId changes', async () => {
        const frame1 = createMockFrame('frame1', 'Frame 1');

        getAllByPageIdSpy.mockResolvedValue({
            success: true,
            status: 200,
            parsedData: [frame1],
        });

        getConstraintsSpy.mockResolvedValue({
            success: true,
            status: 200,
            parsedData: createMockConstraints({
                selectionAllowed: createMockPropertyState(true),
            }),
        });

        const { rerender } = renderHookWithProviders(
            (props: { pageId: string | null }) => useDocumentTools(sdk, props.pageId),
            {
                initialProps: { pageId: 'page1' },
            },
        );

        // Clear initial calls from hook mount
        jest.clearAllMocks();

        await act(async () => {
            await triggerCallback([createMockFrameLayout('frame1', true)]);
        });

        await waitFor(() => {
            expect(getAllByPageIdSpy).toHaveBeenCalledWith('page1');
        });

        // Change pageId
        rerender({ pageId: 'page2' });

        // Clear calls from rerender
        jest.clearAllMocks();

        await act(async () => {
            await triggerCallback([createMockFrameLayout('frame1', true)]);
        });

        await waitFor(() => {
            expect(getAllByPageIdSpy).toHaveBeenCalledWith('page2');
        });
    });
});

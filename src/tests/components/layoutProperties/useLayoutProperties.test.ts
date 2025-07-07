import EditorSDK, {
    ColorType,
    ColorUsageType,
    LayoutIntent,
    LayoutPropertiesType,
    MeasurementUnit,
    PageSize,
} from '@chili-publish/studio-sdk';
import { act } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import { renderHookWithProviders } from '@tests/mocks/Provider';
import { useLayoutProperties } from '../../../components/layoutProperties/useLayoutProperties';

describe('useLayoutProperties', () => {
    const createMockPropertyState = <T>(value: T) => ({
        value,
        isOverride: false,
        isReadOnly: false,
    });

    const mockLayout: LayoutPropertiesType = {
        id: 'layout1',
        name: 'Test Layout',
        displayName: 'Test Layout',
        width: createMockPropertyState(500),
        height: createMockPropertyState(800),
        animated: createMockPropertyState(false),
        intent: createMockPropertyState(LayoutIntent.digitalStatic),
        unit: createMockPropertyState('px' as MeasurementUnit),
        fillColor: createMockPropertyState({
            type: ColorUsageType.local,
            color: {
                type: ColorType.rgb,
                r: 255,
                g: 255,
                b: 255,
            },
            opacity: 100,
        }),
        fillColorEnabled: createMockPropertyState(true),
        bleed: createMockPropertyState(undefined),
        availableForUser: true,
        selectedByUser: true,
        timelineLengthMs: createMockPropertyState(5000),
        resizableByUser: {
            enabled: true,
            minWidth: 100,
            maxWidth: 1000,
            minHeight: 200,
            maxHeight: 2000,
        },
    };

    const mockActivePageDetails: PageSize = {
        id: 'page1',
        width: 500,
        height: 800,
    };

    beforeEach(() => {
        const mockSDK = mock<EditorSDK>();
        mockSDK.page.setWidth = jest.fn();
        mockSDK.page.setHeight = jest.fn();
        window.StudioUISDK = mockSDK;
    });

    it('should initialize with correct values', () => {
        const { result } = renderHookWithProviders(() => useLayoutProperties(mockLayout, mockActivePageDetails));

        expect(result.current.pageWidth).toBe('500 px');
        expect(result.current.pageHeight).toBe('800 px');
        expect(result.current.widthInputHelpText).toBe('Min: 100 Max: 1000');
        expect(result.current.heightInputHelpText).toBe('Min: 200 Max: 2000');
    });

    it('should handle width change correctly', async () => {
        const { result } = renderHookWithProviders(() => useLayoutProperties(mockLayout, mockActivePageDetails));

        await act(async () => {
            await result.current.handleChange('width', '600');
        });

        expect(window.StudioUISDK.page.setWidth).toHaveBeenCalledWith('page1', '600');
    });

    it('should handle height change correctly', async () => {
        const { result } = renderHookWithProviders(() => useLayoutProperties(mockLayout, mockActivePageDetails));

        await act(async () => {
            await result.current.handleChange('height', '900');
        });

        expect(window.StudioUISDK.page.setHeight).toHaveBeenCalledWith('page1', '900');
    });

    it('should update help text when min/max constraints are not provided', () => {
        const layoutWithoutConstraints: LayoutPropertiesType = {
            id: 'layout2',
            name: 'Test Layout 2',
            displayName: 'Test Layout 2',
            width: createMockPropertyState(500),
            height: createMockPropertyState(800),
            animated: createMockPropertyState(false),
            intent: createMockPropertyState(LayoutIntent.digitalStatic),
            unit: createMockPropertyState('px' as MeasurementUnit),
            fillColor: createMockPropertyState({
                type: ColorUsageType.local,
                color: {
                    type: ColorType.rgb,
                    r: 255,
                    g: 255,
                    b: 255,
                },
                opacity: 100,
            }),
            fillColorEnabled: createMockPropertyState(true),
            bleed: createMockPropertyState(undefined),
            availableForUser: true,
            selectedByUser: true,
            timelineLengthMs: createMockPropertyState(5000),
            resizableByUser: {
                enabled: true,
                minWidth: undefined,
                maxWidth: undefined,
                minHeight: undefined,
                maxHeight: undefined,
            },
        };

        const { result } = renderHookWithProviders(() =>
            useLayoutProperties(layoutWithoutConstraints, mockActivePageDetails),
        );

        expect(result.current.widthInputHelpText).toBeUndefined();
        expect(result.current.heightInputHelpText).toBeUndefined();
    });

    it('should show help text when only min constraints are provided', () => {
        const layoutWithMinOnly: LayoutPropertiesType = {
            ...mockLayout,
            id: 'layout3',
            name: 'Test Layout 3',
            displayName: 'Test Layout 3',
            resizableByUser: {
                enabled: true,
                minWidth: 100,
                maxWidth: undefined,
                minHeight: 200,
                maxHeight: undefined,
            },
        };

        const { result } = renderHookWithProviders(() => useLayoutProperties(layoutWithMinOnly, mockActivePageDetails));

        expect(result.current.widthInputHelpText).toBe('Min: 100');
        expect(result.current.heightInputHelpText).toBe('Min: 200');
    });

    it('should show help text when only max constraints are provided', () => {
        const layoutWithMaxOnly: LayoutPropertiesType = {
            ...mockLayout,
            id: 'layout4',
            name: 'Test Layout 4',
            displayName: 'Test Layout 4',
            resizableByUser: {
                enabled: true,
                minWidth: undefined,
                maxWidth: 1000,
                minHeight: undefined,
                maxHeight: 2000,
            },
        };

        const { result } = renderHookWithProviders(() => useLayoutProperties(layoutWithMaxOnly, mockActivePageDetails));

        expect(result.current.widthInputHelpText).toBe('Max: 1000');
        expect(result.current.heightInputHelpText).toBe('Max: 2000');
    });

    it('should handle SDK setWidth errors gracefully', async () => {
        const { result } = renderHookWithProviders(() => useLayoutProperties(mockLayout, mockActivePageDetails));

        // Mock SDK error
        (window.StudioUISDK.page.setWidth as jest.Mock).mockRejectedValueOnce(new Error('SDK Error'));

        await act(async () => {
            await result.current.handleChange('width', '600');
        });

        // Should revert to previous valid value
        expect(result.current.pageWidth).toBe('500 px');
    });

    it('should handle SDK setHeight errors gracefully', async () => {
        const { result } = renderHookWithProviders(() => useLayoutProperties(mockLayout, mockActivePageDetails));

        // Mock SDK error
        (window.StudioUISDK.page.setHeight as jest.Mock).mockRejectedValueOnce(new Error('SDK Error'));

        await act(async () => {
            await result.current.handleChange('height', '900');
        });

        // Should revert to previous valid value
        expect(result.current.pageHeight).toBe('800 px');
    });
});

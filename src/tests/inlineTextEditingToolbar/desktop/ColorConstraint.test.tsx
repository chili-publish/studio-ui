/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    FrameConstraints,
    SelectedTextStyle,
    DocumentColor,
    ColorType,
    SelectedTextStyles,
    TextStyleUpdateType,
    ColorUsageType,
} from '@chili-publish/studio-sdk';
import { mock } from 'jest-mock-extended';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorSDK from '@chili-publish/studio-sdk';
import { renderWithProviders } from '@tests/mocks/Provider';
import { getDataTestIdForSUI } from 'src/utils/dataIds';
import { APP_WRAPPER_ID } from 'src/utils/constants';
import ColorConstraint from 'src/components/inlineTextEditingToolbar/desktop/colorConstraint/ColorConstraint';
import { ColorUsage, ColorUsageTypeEnum, convertColor } from '@chili-publish/grafx-shared-components';

jest.mock('@chili-publish/studio-sdk');
jest.mock('@chili-publish/grafx-shared-components', () => ({
    ...jest.requireActual('@chili-publish/grafx-shared-components'),
    convertColor: jest.fn(),
}));

const createMockFrameConstraints = (overrides?: any): FrameConstraints => {
    const defaultText = {
        editingAllowed: {
            value: true,
            isOverride: false,
            isReadOnly: false,
        },
        paragraphStyles: {
            value: { allowed: false, ids: [] },
            isOverride: false,
            isReadOnly: false,
        },
        characterStyles: {
            value: { allowed: false, ids: [] },
            isOverride: false,
            isReadOnly: false,
        },
        fontSizes: {
            value: { allowed: false, min: 0, max: 100 },
            isOverride: false,
            isReadOnly: false,
        },
        colors: {
            value: { allowed: false, ids: [] },
            isOverride: false,
            isReadOnly: false,
        },
    };

    return {
        text: {
            ...defaultText,
            ...(overrides?.text || {}),
        },
    } as unknown as FrameConstraints;
};

describe('ColorConstraint', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'rgbToCMYK', {
            configurable: true,
            enumerable: true,
            value: jest.fn().mockReturnValue([0, 0, 0, 0]),
            writable: true,
        });
        Object.defineProperty(window, 'cmykToRGB', {
            configurable: true,
            enumerable: true,
            value: jest.fn().mockReturnValue([0, 0, 0]),
            writable: true,
        });
    });

    let mockSDK: ReturnType<typeof mock<EditorSDK>>;
    const mockConvertColor = convertColor as jest.MockedFunction<typeof convertColor>;

    const mockColor1: DocumentColor = {
        id: 'color-1',
        name: 'Red',
        color: {
            type: ColorType.rgb,
            r: 255,
            g: 0,
            b: 0,
        } as any,
    } as DocumentColor;

    const mockColor2: DocumentColor = {
        id: 'color-2',
        name: 'Blue',
        color: {
            type: ColorType.rgb,
            r: 0,
            g: 0,
            b: 255,
        } as any,
    } as DocumentColor;

    const mockColorUsage: ColorUsage = {
        id: 'color-1',
        type: ColorUsageTypeEnum.local,
        color: {
            type: ColorType.rgb,
            r: 255,
            g: 0,
            b: 0,
        } as any,
    };

    beforeEach(() => {
        mockSDK = mock<EditorSDK>();
        mockSDK.colorStyle = {
            getById: jest.fn(),
        } as any;
        mockSDK.textSelection = {
            set: jest.fn(),
        } as any;

        window.StudioUISDK = mockSDK;
        mockConvertColor.mockResolvedValue({
            hex: { value: '#FF0000' },
        } as any);

        // Create APP_WRAPPER element for tooltip and modal anchoring
        const appWrapper = document.createElement('div');
        appWrapper.id = APP_WRAPPER_ID;
        document.body.appendChild(appWrapper);
    });

    afterEach(() => {
        jest.clearAllMocks();
        const appWrapper = document.getElementById(APP_WRAPPER_ID);
        if (appWrapper) {
            document.body.removeChild(appWrapper);
        }
    });

    it('should display color value from textStyle', async () => {
        const selectedTextStyle: SelectedTextStyle = {
            color: mockColorUsage,
        } as unknown as SelectedTextStyle;

        renderWithProviders(<ColorConstraint frameConstraints={createMockFrameConstraints()} />, {
            preloadedState: {
                frames: {
                    selectedFrameContent: null,
                    selectedTextProperties: selectedTextStyle,
                },
            },
        });

        await waitFor(() => {
            expect(mockConvertColor).toHaveBeenCalledWith(mockColorUsage.color!.type, mockColorUsage.color!);
        });

        await waitFor(() => {
            const colorContainer = screen.getByTestId(getDataTestIdForSUI('color-constraint-container'));
            expect(colorContainer).toBeInTheDocument();
            expect(colorContainer).toHaveStyle('background-color: #FF0000');
        });
    });

    it('should open color picker modal when color container is clicked', async () => {
        const selectedTextStyle: SelectedTextStyle = {
            color: mockColorUsage,
        } as unknown as SelectedTextStyle;

        mockConvertColor.mockResolvedValue({
            hex: { value: '#eaeaea' },
        } as any);

        renderWithProviders(<ColorConstraint frameConstraints={createMockFrameConstraints()} />, {
            preloadedState: {
                frames: {
                    selectedFrameContent: null,
                    selectedTextProperties: selectedTextStyle,
                },
            },
        });

        await waitFor(() => {
            expect(mockConvertColor).toHaveBeenCalled();
        });

        const user = userEvent.setup();
        const colorContainer = screen.getByTestId(getDataTestIdForSUI('color-constraint-container'));
        expect(colorContainer).toBeInTheDocument();
        await waitFor(() => {
            expect(colorContainer).toHaveStyle('background-color: #eaeaea');
        });

        await user.click(colorContainer);

        await waitFor(() => {
            expect(screen.getByTestId(getDataTestIdForSUI('style-color-picker-dialog'))).toBeInTheDocument();
        });
    });

    it('should be able to select a color from the color grid', async () => {
        const frameConstraints = createMockFrameConstraints({
            text: {
                colors: {
                    value: { allowed: true, ids: ['color-1', 'color-2'] },
                    isOverride: false,
                    isReadOnly: false,
                },
            },
        });

        (mockSDK.colorStyle.getById as jest.Mock)
            .mockResolvedValueOnce({ parsedData: mockColor1 })
            .mockResolvedValueOnce({ parsedData: mockColor2 });

        const selectedTextStyle: SelectedTextStyle = {
            color: mockColorUsage,
        } as unknown as SelectedTextStyle;

        mockConvertColor
            .mockResolvedValueOnce({
                hex: { value: '#FF0000' },
            } as any)
            .mockResolvedValueOnce({
                hex: { value: '#0000FF' },
            } as any);

        renderWithProviders(<ColorConstraint frameConstraints={frameConstraints} />, {
            preloadedState: {
                frames: {
                    selectedFrameContent: null,
                    selectedTextProperties: selectedTextStyle,
                },
            },
        });

        await waitFor(() => {
            expect(mockConvertColor).toHaveBeenCalled();
        });

        const user = userEvent.setup();
        const colorContainer = screen.getByTestId(getDataTestIdForSUI('color-constraint-container'));
        await waitFor(() => {
            expect(colorContainer).toHaveStyle('background-color: #FF0000');
        });
        await user.click(colorContainer);

        await waitFor(() => {
            expect(screen.getByTestId(getDataTestIdForSUI('style-color-picker-dialog'))).toBeInTheDocument();
        });

        // Wait for colors to be loaded
        await waitFor(() => {
            expect(mockSDK.colorStyle.getById).toHaveBeenCalledTimes(2);
        });

        // Find and click a color in the grid
        // The ColorGrid component should render the colors
        // We'll need to find the color element and click it
        await waitFor(() => {
            const colorGrid = screen.getByTestId(getDataTestIdForSUI('style-color-picker-dialog'));
            expect(colorGrid).toBeInTheDocument();
        });

        const colorGrid = screen.getByTestId(getDataTestIdForSUI('style-color-picker-dialog'));
        const colorGridColors = within(colorGrid).getAllByTestId(/-color-card$/);
        expect(colorGridColors).toHaveLength(2);

        expect(within(colorGridColors[0]).getByText('Red')).toBeInTheDocument();
        expect(within(colorGridColors[1]).getByText('Blue')).toBeInTheDocument();

        await user.click(colorGridColors[1].children[0]);

        await waitFor(() => {
            expect(mockSDK.textSelection.set).toHaveBeenCalledWith({
                [SelectedTextStyles.COLOR]: {
                    value: { id: mockColor2.id, color: mockColor2.color, type: ColorUsageType.brandKit },
                },
            } as TextStyleUpdateType);
        });
    });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    FrameConstraints,
    DocumentColor,
    ColorType,
    SelectedTextStyles,
    TextStyleUpdateType,
    ColorUsageType,
} from '@chili-publish/studio-sdk';
import { mock } from 'jest-mock-extended';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorSDK from '@chili-publish/studio-sdk';
import { renderWithProviders } from '@tests/mocks/Provider';
import MobileColorConstraint from 'src/components/inlineTextEditingToolbar/mobile/colorConstraint/MobileColorConstraint';

jest.mock('@chili-publish/studio-sdk');

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

describe('MobileColorConstraint', () => {
    let mockSDK: ReturnType<typeof mock<EditorSDK>>;

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

        mockSDK = mock<EditorSDK>();
        mockSDK.colorStyle = {
            getById: jest.fn(),
        } as any;
        mockSDK.textSelection = {
            set: jest.fn(),
        } as any;

        window.StudioUISDK = mockSDK;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should display empty state message when no colors are available', () => {
        const frameConstraints = createMockFrameConstraints({
            text: {
                colors: {
                    value: { allowed: true, ids: [] },
                    isOverride: false,
                    isReadOnly: false,
                },
            },
        });

        renderWithProviders(<MobileColorConstraint frameConstraints={frameConstraints} />);

        expect(screen.getByText('Any colors added to the Brand Kit will be available here.')).toBeInTheDocument();
        expect(screen.queryByText('Select a color')).not.toBeInTheDocument();
    });

    it('should fetch and display colors when colorIds are provided', async () => {
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

        renderWithProviders(<MobileColorConstraint frameConstraints={frameConstraints} />);

        await waitFor(() => {
            expect(mockSDK.colorStyle.getById).toHaveBeenCalledTimes(2);
            expect(mockSDK.colorStyle.getById).toHaveBeenCalledWith('color-1');
            expect(mockSDK.colorStyle.getById).toHaveBeenCalledWith('color-2');
        });

        await waitFor(() => {
            expect(screen.getByText('Red')).toBeInTheDocument();
            expect(screen.getByText('Blue')).toBeInTheDocument();
        });

        expect(screen.getByText('Select a color')).toBeInTheDocument();
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

        renderWithProviders(<MobileColorConstraint frameConstraints={frameConstraints} />);

        await waitFor(() => {
            expect(mockSDK.colorStyle.getById).toHaveBeenCalledTimes(2);
        });

        await waitFor(() => {
            expect(screen.getByText('Red')).toBeInTheDocument();
            expect(screen.getByText('Blue')).toBeInTheDocument();
        });

        const user = userEvent.setup();
        const colorCards = screen.getAllByTestId(/-color-card$/);
        expect(colorCards).toHaveLength(2);

        // Click on the second color (Blue)
        await user.click(colorCards[1].children[0]);

        await waitFor(() => {
            expect(mockSDK.textSelection.set).toHaveBeenCalledWith({
                [SelectedTextStyles.COLOR]: {
                    value: {
                        id: mockColor2.id,
                        color: mockColor2.color,
                        type: ColorUsageType.brandKit,
                    },
                },
            } as TextStyleUpdateType);
        });
    });
});

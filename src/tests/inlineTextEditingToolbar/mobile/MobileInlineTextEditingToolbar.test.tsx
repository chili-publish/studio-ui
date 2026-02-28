/* eslint-disable @typescript-eslint/no-explicit-any */
import { FrameConstraints, SelectedTextStyle } from '@chili-publish/studio-sdk';
import { mock } from 'jest-mock-extended';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorSDK from '@chili-publish/studio-sdk';
import { renderWithProviders } from '@tests/mocks/Provider';
import MobileInlineTextEditingToolbar from 'src/components/inlineTextEditingToolbar/mobile/MobileInlineTextEditingToolbar';
import { getDataTestIdForSUI } from 'src/utils/dataIds';
import { APP_WRAPPER_ID } from 'src/utils/constants';

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

describe('MobileInlineTextEditingToolbar', () => {
    let mockSDK: ReturnType<typeof mock<EditorSDK>>;
    const mockSelectedTextStyle: SelectedTextStyle = {
        paragraphStyleId: 'style-1',
    } as SelectedTextStyle;

    beforeEach(() => {
        mockSDK = mock<EditorSDK>();

        mockSDK.paragraphStyle = {
            getById: jest.fn().mockResolvedValue({ parsedData: null }),
        } as any;

        mockSDK.characterStyle = {
            getById: jest.fn().mockResolvedValue({ parsedData: null }),
        } as any;

        mockSDK.colorStyle = {
            getById: jest.fn().mockResolvedValue({ parsedData: null }),
        } as any;

        mockSDK.textSelection = {
            set: jest.fn(),
        } as any;

        mockSDK.frame = {
            constraints: {
                get: jest.fn(),
            },
        } as any;

        window.StudioUISDK = mockSDK;

        // Create APP_WRAPPER element for tray anchoring
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

    describe('Rendering conditions', () => {
        it('should not render when text editing is not allowed', async () => {
            const frameConstraints = createMockFrameConstraints({
                text: {
                    editingAllowed: {
                        value: false,
                        isOverride: false,
                        isReadOnly: false,
                    },
                } as any,
            });

            (mockSDK.frame.constraints.get as jest.Mock).mockResolvedValue({
                parsedData: frameConstraints,
            });

            const { container } = renderWithProviders(<MobileInlineTextEditingToolbar />, {
                preloadedState: {
                    frames: {
                        selectedFrameContent: { id: 'frame-1' } as any,
                        selectedTextProperties: mockSelectedTextStyle,
                    },
                },
            });

            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            });
        });

        it('should not render when text is not in edit mode', async () => {
            const frameConstraints = createMockFrameConstraints();

            (mockSDK.frame.constraints.get as jest.Mock).mockResolvedValue({
                parsedData: frameConstraints,
            });

            const { container } = renderWithProviders(<MobileInlineTextEditingToolbar />, {
                preloadedState: {
                    frames: {
                        selectedFrameContent: { id: 'frame-1' } as any,
                        selectedTextProperties: null,
                    },
                },
            });

            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            });
        });

        it('should render toolbar when text editing is allowed and text is in edit mode', async () => {
            const frameConstraints = createMockFrameConstraints();

            (mockSDK.frame.constraints.get as jest.Mock).mockResolvedValue({
                parsedData: frameConstraints,
            });

            renderWithProviders(<MobileInlineTextEditingToolbar />, {
                preloadedState: {
                    frames: {
                        selectedFrameContent: { id: 'frame-1' } as any,
                        selectedTextProperties: mockSelectedTextStyle,
                    },
                },
            });

            await waitFor(() => {
                expect(
                    screen.getByTestId(getDataTestIdForSUI('mobile-inline-text-editing-toolbar')),
                ).toBeInTheDocument();
            });
        });
    });

    describe('Toolbar buttons', () => {
        it('should render paragraph style button when constraint is enabled', async () => {
            const frameConstraints = createMockFrameConstraints({
                text: {
                    paragraphStyles: {
                        value: { allowed: true, ids: ['style-1'] },
                        isOverride: false,
                        isReadOnly: false,
                    },
                },
            });

            (mockSDK.frame.constraints.get as jest.Mock).mockResolvedValue({
                parsedData: frameConstraints,
            });

            renderWithProviders(<MobileInlineTextEditingToolbar />, {
                preloadedState: {
                    frames: {
                        selectedFrameContent: { id: 'frame-1' } as any,
                        selectedTextProperties: mockSelectedTextStyle,
                    },
                },
            });

            await waitFor(() => {
                const toolbar = screen.getByTestId(getDataTestIdForSUI('mobile-inline-text-editing-toolbar'));
                expect(toolbar).toBeInTheDocument();
                const buttons = screen.getAllByRole('button');
                expect(buttons.length).toBe(1);
                expect(
                    screen.getByTestId(getDataTestIdForSUI('paragraph-style-constraint-button')),
                ).toBeInTheDocument();
            });
        });

        it('should render character style button when constraint is enabled', async () => {
            const frameConstraints = createMockFrameConstraints({
                text: {
                    characterStyles: {
                        value: { allowed: true, ids: ['style-1'] },
                        isOverride: false,
                        isReadOnly: false,
                    },
                },
            });

            (mockSDK.frame.constraints.get as jest.Mock).mockResolvedValue({
                parsedData: frameConstraints,
            });

            renderWithProviders(<MobileInlineTextEditingToolbar />, {
                preloadedState: {
                    frames: {
                        selectedFrameContent: { id: 'frame-1' } as any,
                        selectedTextProperties: mockSelectedTextStyle,
                    },
                },
            });

            await waitFor(() => {
                const toolbar = screen.getByTestId(getDataTestIdForSUI('mobile-inline-text-editing-toolbar'));
                expect(toolbar).toBeInTheDocument();
                const buttons = screen.getAllByRole('button');
                expect(buttons.length).toBe(1);
                expect(
                    screen.getByTestId(getDataTestIdForSUI('character-style-constraint-button')),
                ).toBeInTheDocument();
            });
        });

        it('should render font size button when constraint is enabled', async () => {
            const frameConstraints = createMockFrameConstraints({
                text: {
                    fontSizes: {
                        value: { allowed: true, min: 12, max: 16 },
                        isOverride: false,
                        isReadOnly: false,
                    },
                },
            });

            (mockSDK.frame.constraints.get as jest.Mock).mockResolvedValue({
                parsedData: frameConstraints,
            });

            renderWithProviders(<MobileInlineTextEditingToolbar />, {
                preloadedState: {
                    frames: {
                        selectedFrameContent: { id: 'frame-1' } as any,
                        selectedTextProperties: mockSelectedTextStyle,
                    },
                },
            });

            await waitFor(() => {
                const toolbar = screen.getByTestId(getDataTestIdForSUI('mobile-inline-text-editing-toolbar'));
                expect(toolbar).toBeInTheDocument();
                const buttons = screen.getAllByRole('button');
                expect(buttons.length).toBe(1);
                expect(screen.getByTestId(getDataTestIdForSUI('font-size-constraint-button'))).toBeInTheDocument();
            });
        });

        it('should render color button when constraint is enabled', async () => {
            const frameConstraints = createMockFrameConstraints({
                text: {
                    colors: {
                        value: { allowed: true, ids: ['color-1'] },
                        isOverride: false,
                        isReadOnly: false,
                    },
                },
            });

            (mockSDK.frame.constraints.get as jest.Mock).mockResolvedValue({
                parsedData: frameConstraints,
            });

            renderWithProviders(<MobileInlineTextEditingToolbar />, {
                preloadedState: {
                    frames: {
                        selectedFrameContent: { id: 'frame-1' } as any,
                        selectedTextProperties: mockSelectedTextStyle,
                    },
                },
            });

            await waitFor(() => {
                const toolbar = screen.getByTestId(getDataTestIdForSUI('mobile-inline-text-editing-toolbar'));
                expect(toolbar).toBeInTheDocument();
                const buttons = screen.getAllByRole('button');
                expect(buttons.length).toBe(1);
                expect(screen.getByTestId(getDataTestIdForSUI('color-constraint-button'))).toBeInTheDocument();
            });
        });

        it('should render all enabled constraint buttons', async () => {
            const frameConstraints = createMockFrameConstraints({
                text: {
                    paragraphStyles: {
                        value: { allowed: true, ids: ['style-1'] },
                        isOverride: false,
                        isReadOnly: false,
                    },
                    characterStyles: {
                        value: { allowed: true, ids: ['style-1'] },
                        isOverride: false,
                        isReadOnly: false,
                    },
                    fontSizes: {
                        value: { allowed: true, min: 12, max: 16 },
                        isOverride: false,
                        isReadOnly: false,
                    },
                    colors: {
                        value: { allowed: true, ids: ['color-1'] },
                        isOverride: false,
                        isReadOnly: false,
                    },
                },
            });

            (mockSDK.frame.constraints.get as jest.Mock).mockResolvedValue({
                parsedData: frameConstraints,
            });

            renderWithProviders(<MobileInlineTextEditingToolbar />, {
                preloadedState: {
                    frames: {
                        selectedFrameContent: { id: 'frame-1' } as any,
                        selectedTextProperties: mockSelectedTextStyle,
                    },
                },
            });

            await waitFor(() => {
                const toolbar = screen.getByTestId(getDataTestIdForSUI('mobile-inline-text-editing-toolbar'));
                expect(toolbar).toBeInTheDocument();
                const buttons = screen.getAllByRole('button');
                expect(buttons.length).toBe(4);
                expect(
                    screen.getByTestId(getDataTestIdForSUI('paragraph-style-constraint-button')),
                ).toBeInTheDocument();
                expect(
                    screen.getByTestId(getDataTestIdForSUI('character-style-constraint-button')),
                ).toBeInTheDocument();
                expect(screen.getByTestId(getDataTestIdForSUI('font-size-constraint-button'))).toBeInTheDocument();
                expect(screen.getByTestId(getDataTestIdForSUI('color-constraint-button'))).toBeInTheDocument();
            });
        });
    });

    describe('Tray interactions', () => {
        it('should open paragraph style tray when paragraph button is clicked', async () => {
            const frameConstraints = createMockFrameConstraints({
                text: {
                    paragraphStyles: {
                        value: { allowed: true, ids: ['style-1'] },
                        isOverride: false,
                        isReadOnly: false,
                    },
                },
            });

            (mockSDK.frame.constraints.get as jest.Mock).mockResolvedValue({
                parsedData: frameConstraints,
            });

            renderWithProviders(<MobileInlineTextEditingToolbar />, {
                preloadedState: {
                    frames: {
                        selectedFrameContent: { id: 'frame-1' } as any,
                        selectedTextProperties: mockSelectedTextStyle,
                    },
                },
            });

            await waitFor(() => {
                expect(
                    screen.getByTestId(getDataTestIdForSUI('paragraph-style-constraint-button')),
                ).toBeInTheDocument();
            });

            const user = userEvent.setup();

            const paragraphStyleButton = screen.getByTestId(getDataTestIdForSUI('paragraph-style-constraint-button'));
            await user.click(paragraphStyleButton);

            await waitFor(() => {
                expect(screen.getByTestId(getDataTestIdForSUI('text-editing-mobile-view-tray'))).toBeInTheDocument();
            });
        });

        it('should open character style tray when character button is clicked', async () => {
            const frameConstraints = createMockFrameConstraints({
                text: {
                    characterStyles: {
                        value: { allowed: true, ids: ['style-1'] },
                        isOverride: false,
                        isReadOnly: false,
                    },
                },
            });

            (mockSDK.frame.constraints.get as jest.Mock).mockResolvedValue({
                parsedData: frameConstraints,
            });

            renderWithProviders(<MobileInlineTextEditingToolbar />, {
                preloadedState: {
                    frames: {
                        selectedFrameContent: { id: 'frame-1' } as any,
                        selectedTextProperties: mockSelectedTextStyle,
                    },
                },
            });

            await waitFor(() => {
                expect(
                    screen.getByTestId(getDataTestIdForSUI('character-style-constraint-button')),
                ).toBeInTheDocument();
            });

            const user = userEvent.setup();

            const characterStyleButton = screen.getByTestId(getDataTestIdForSUI('character-style-constraint-button'));
            await user.click(characterStyleButton);

            await waitFor(() => {
                expect(screen.getByTestId(getDataTestIdForSUI('text-editing-mobile-view-tray'))).toBeInTheDocument();
            });
        });

        it('should open font size tray when font size button is clicked', async () => {
            const frameConstraints = createMockFrameConstraints({
                text: {
                    fontSizes: {
                        value: { allowed: true, min: 12, max: 14 },
                        isOverride: false,
                        isReadOnly: false,
                    },
                },
            });

            (mockSDK.frame.constraints.get as jest.Mock).mockResolvedValue({
                parsedData: frameConstraints,
            });

            renderWithProviders(<MobileInlineTextEditingToolbar />, {
                preloadedState: {
                    frames: {
                        selectedFrameContent: { id: 'frame-1' } as any,
                        selectedTextProperties: mockSelectedTextStyle,
                    },
                },
            });

            await waitFor(() => {
                expect(screen.getByTestId(getDataTestIdForSUI('font-size-constraint-button'))).toBeInTheDocument();
            });

            const user = userEvent.setup();

            const fontSizeButton = screen.getByTestId(getDataTestIdForSUI('font-size-constraint-button'));
            await user.click(fontSizeButton);

            await waitFor(() => {
                expect(screen.getByTestId(getDataTestIdForSUI('text-editing-mobile-view-tray'))).toBeInTheDocument();
            });
        });

        it('should open color tray when color button is clicked', async () => {
            const frameConstraints = createMockFrameConstraints({
                text: {
                    colors: {
                        value: { allowed: true, ids: ['color-1'] },
                        isOverride: false,
                        isReadOnly: false,
                    },
                },
            });

            (mockSDK.frame.constraints.get as jest.Mock).mockResolvedValue({
                parsedData: frameConstraints,
            });

            renderWithProviders(<MobileInlineTextEditingToolbar />, {
                preloadedState: {
                    frames: {
                        selectedFrameContent: { id: 'frame-1' } as any,
                        selectedTextProperties: mockSelectedTextStyle,
                    },
                },
            });

            await waitFor(() => {
                expect(screen.getByTestId(getDataTestIdForSUI('color-constraint-button'))).toBeInTheDocument();
            });

            const user = userEvent.setup();

            const colorButton = screen.getByTestId(getDataTestIdForSUI('color-constraint-button'));
            await user.click(colorButton);

            await waitFor(() => {
                expect(screen.getByTestId(getDataTestIdForSUI('text-editing-mobile-view-tray'))).toBeInTheDocument();
            });
        });

        it('should display "Color" title when color tray is open', async () => {
            const frameConstraints = createMockFrameConstraints({
                text: {
                    colors: {
                        value: { allowed: true, ids: ['color-1'] },
                        isOverride: false,
                        isReadOnly: false,
                    },
                },
            });

            (mockSDK.frame.constraints.get as jest.Mock).mockResolvedValue({
                parsedData: frameConstraints,
            });

            renderWithProviders(<MobileInlineTextEditingToolbar />, {
                preloadedState: {
                    frames: {
                        selectedFrameContent: { id: 'frame-1' } as any,
                        selectedTextProperties: mockSelectedTextStyle,
                    },
                },
            });

            await waitFor(() => {
                expect(screen.getByTestId(getDataTestIdForSUI('color-constraint-button'))).toBeInTheDocument();
            });

            const user = userEvent.setup();
            const colorButton = screen.getByTestId(getDataTestIdForSUI('color-constraint-button'));
            await user.click(colorButton);

            await waitFor(() => {
                const tray = screen.getByTestId(getDataTestIdForSUI('text-editing-mobile-view-tray'));
                expect(tray).toBeInTheDocument();
                expect(screen.getByText('Color')).toBeInTheDocument();
            });
        });
    });
});

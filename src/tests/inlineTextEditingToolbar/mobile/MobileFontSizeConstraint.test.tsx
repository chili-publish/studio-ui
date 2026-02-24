/* eslint-disable @typescript-eslint/no-explicit-any */
import { FrameConstraints, SelectedTextStyle, SelectedTextStyles } from '@chili-publish/studio-sdk';
import { mock } from 'jest-mock-extended';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorSDK from '@chili-publish/studio-sdk';
import { renderWithProviders } from 'src/tests/mocks/Provider';
import { getDataTestIdForSUI } from 'src/utils/dataIds';
import MobileFontSizeConstraint from 'src/components/inlineTextEditingToolbar/mobile/fontSizeConstraint/MobileFontSizeConstraint';

jest.mock('@chili-publish/studio-sdk');

describe('MobileFontSizeConstraint', () => {
    let mockSDK: ReturnType<typeof mock<EditorSDK>>;

    beforeEach(() => {
        mockSDK = mock<EditorSDK>();
        mockSDK.textSelection = {
            set: jest.fn(),
        } as any;

        window.StudioUISDK = mockSDK;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should display the fontSize value from textStyle', () => {
        const selectedTextStyle: SelectedTextStyle = {
            fontSize: 16,
        } as SelectedTextStyle;

        renderWithProviders(<MobileFontSizeConstraint frameConstraints={null} />, {
            preloadedState: {
                frames: {
                    selectedFrameContent: null,
                    selectedTextProperties: selectedTextStyle,
                },
            },
        });

        const input = screen.getByTestId(getDataTestIdForSUI('mobile-font-size-constraint')) as HTMLInputElement;
        expect(input.value).toBe('16');
    });

    it('should call textSelection.set when value changes via onBlur', async () => {
        const selectedTextStyle: SelectedTextStyle = {
            fontSize: 16,
        } as SelectedTextStyle;

        renderWithProviders(<MobileFontSizeConstraint frameConstraints={null} />, {
            preloadedState: {
                frames: {
                    selectedFrameContent: null,
                    selectedTextProperties: selectedTextStyle,
                },
            },
        });

        const input = screen.getByTestId(getDataTestIdForSUI('mobile-font-size-constraint'));
        const user = userEvent.setup();

        await user.clear(input);
        await user.type(input, '24');
        await user.tab();

        await waitFor(() => {
            expect(mockSDK.textSelection.set).toHaveBeenCalledWith({
                [SelectedTextStyles.FONT_SIZE]: { value: 24 },
            });
        });
    });

    it('minus button should be disabled user manually enters the min value', async () => {
        const selectedTextStyle: SelectedTextStyle = {
            fontSize: 15,
        } as SelectedTextStyle;

        const { container } = renderWithProviders(
            <MobileFontSizeConstraint
                frameConstraints={
                    {
                        text: {
                            fontSizes: {
                                value: { allowed: true, min: 14, max: 20 },
                                isOverride: false,
                                isReadOnly: false,
                            },
                        },
                    } as unknown as FrameConstraints
                }
            />,
            {
                preloadedState: {
                    frames: {
                        selectedFrameContent: null,
                        selectedTextProperties: selectedTextStyle,
                    },
                },
            },
        );

        const input = screen.getByTestId(getDataTestIdForSUI('mobile-font-size-constraint')) as HTMLInputElement;
        const inputWrapper = container.querySelector(`[data-id="sui-mobile-font-size-constraint-input-wrapper"]`);
        expect(inputWrapper).toBeInTheDocument();
        const buttons = await within(inputWrapper as HTMLElement).findAllByRole('button');
        const minusButton = buttons[0];

        await userEvent.clear(input);
        await userEvent.type(input, '14');
        await userEvent.tab();

        await waitFor(() => {
            expect(mockSDK.textSelection.set).toHaveBeenCalledWith({
                [SelectedTextStyles.FONT_SIZE]: { value: 14 },
            });
        });
        expect(minusButton).toBeDisabled();
    });

    it('plus button should be disabled user manually enters the max value', async () => {
        const selectedTextStyle: SelectedTextStyle = {
            fontSize: 15,
        } as SelectedTextStyle;

        const { container } = renderWithProviders(
            <MobileFontSizeConstraint
                frameConstraints={
                    {
                        text: {
                            fontSizes: {
                                value: { allowed: true, min: 5, max: 16 },
                                isOverride: false,
                                isReadOnly: false,
                            },
                        },
                    } as unknown as FrameConstraints
                }
            />,
            {
                preloadedState: {
                    frames: {
                        selectedFrameContent: null,
                        selectedTextProperties: selectedTextStyle,
                    },
                },
            },
        );

        const input = screen.getByTestId(getDataTestIdForSUI('mobile-font-size-constraint')) as HTMLInputElement;
        const inputWrapper = container.querySelector(`[data-id="sui-mobile-font-size-constraint-input-wrapper"]`);
        expect(inputWrapper).toBeInTheDocument();
        const buttons = await within(inputWrapper as HTMLElement).findAllByRole('button');
        const plusButton = buttons[1];

        await userEvent.clear(input);
        await userEvent.type(input, '16');
        await userEvent.tab();

        await waitFor(() => {
            expect(mockSDK.textSelection.set).toHaveBeenCalledWith({
                [SelectedTextStyles.FONT_SIZE]: { value: 16 },
            });
        });
        expect(plusButton).toBeDisabled();
    });
});

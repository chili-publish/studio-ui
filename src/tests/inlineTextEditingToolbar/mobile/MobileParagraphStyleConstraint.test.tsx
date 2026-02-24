/* eslint-disable @typescript-eslint/no-explicit-any */
import { FrameConstraints, ParagraphStyle, SelectedTextStyle, SelectedTextStyles } from '@chili-publish/studio-sdk';
import { mock } from 'jest-mock-extended';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorSDK from '@chili-publish/studio-sdk';
import { renderWithProviders } from 'src/tests/mocks/Provider';
import MobileParagraphStyleConstraint from 'src/components/inlineTextEditingToolbar/mobile/paragraphStyleConstraint/MobileParagraphStyleConstraint';

jest.mock('@chili-publish/studio-sdk');

describe('MobileParagraphStyleConstraint', () => {
    let mockSDK: ReturnType<typeof mock<EditorSDK>>;
    const mockParagraphStyle1: ParagraphStyle = {
        id: 'style-1',
        name: 'Heading 1',
    } as ParagraphStyle;

    const mockParagraphStyle2: ParagraphStyle = {
        id: 'style-2',
        name: 'Body Text',
    } as ParagraphStyle;

    const mockParagraphStyle3: ParagraphStyle = {
        id: 'style-3',
        name: 'Caption',
    } as ParagraphStyle;

    beforeEach(() => {
        mockSDK = mock<EditorSDK>();
        mockSDK.paragraphStyle = {
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

    it('should fetch and display paragraph styles when paragraphStyleIds are provided', async () => {
        (mockSDK.paragraphStyle.getById as jest.Mock)
            .mockResolvedValueOnce({ parsedData: mockParagraphStyle1 })
            .mockResolvedValueOnce({ parsedData: mockParagraphStyle2 });

        renderWithProviders(
            <MobileParagraphStyleConstraint
                frameConstraints={
                    {
                        text: {
                            paragraphStyles: {
                                value: { allowed: true, ids: ['style-1', 'style-2'] },
                                isOverride: false,
                                isReadOnly: false,
                            },
                        },
                    } as unknown as FrameConstraints
                }
            />,
        );

        await waitFor(() => {
            expect(mockSDK.paragraphStyle.getById).toHaveBeenCalledTimes(2);
            expect(mockSDK.paragraphStyle.getById).toHaveBeenCalledWith('style-1');
            expect(mockSDK.paragraphStyle.getById).toHaveBeenCalledWith('style-2');
        });

        await waitFor(() => {
            expect(screen.getByText('Heading 1')).toBeInTheDocument();
            expect(screen.getByText('Body Text')).toBeInTheDocument();
        });
    });

    it('should display the selected paragraph style based on textStyle', async () => {
        (mockSDK.paragraphStyle.getById as jest.Mock)
            .mockResolvedValueOnce({ parsedData: mockParagraphStyle1 })
            .mockResolvedValueOnce({ parsedData: mockParagraphStyle2 })
            .mockResolvedValueOnce({ parsedData: mockParagraphStyle3 });

        const selectedTextStyle: SelectedTextStyle = {
            paragraphStyleId: 'style-2',
        } as SelectedTextStyle;

        renderWithProviders(
            <MobileParagraphStyleConstraint
                frameConstraints={
                    {
                        text: {
                            paragraphStyles: {
                                value: { allowed: true, ids: ['style-1', 'style-2', 'style-3'] },
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

        // The selected value should be style-2 (Body Text)
        await waitFor(() => {
            expect(screen.getByText('Body Text')).toBeInTheDocument();
        });
    });

    it('should call textSelection.set when a different style is selected', async () => {
        (mockSDK.paragraphStyle.getById as jest.Mock)
            .mockResolvedValueOnce({ parsedData: mockParagraphStyle1 })
            .mockResolvedValueOnce({ parsedData: mockParagraphStyle2 });

        const selectedTextStyle: SelectedTextStyle = {
            paragraphStyleId: 'style-1',
        } as SelectedTextStyle;

        renderWithProviders(
            <MobileParagraphStyleConstraint
                frameConstraints={
                    {
                        text: {
                            paragraphStyles: {
                                value: { allowed: true, ids: ['style-1', 'style-2'] },
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

        await waitFor(() => {
            expect(screen.getByText('Heading 1')).toBeInTheDocument();
            expect(screen.getByText('Body Text')).toBeInTheDocument();
        });

        const user = userEvent.setup();
        const bodyTextOption = screen.getByText('Body Text');

        await user.click(bodyTextOption);

        await waitFor(() => {
            expect(mockSDK.textSelection.set).toHaveBeenCalledWith({
                [SelectedTextStyles.PARAGRAPH]: { value: 'style-2' },
            });
        });
    });
});

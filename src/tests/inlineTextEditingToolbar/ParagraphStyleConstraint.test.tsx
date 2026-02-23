/* eslint-disable @typescript-eslint/no-explicit-any */
import { FrameConstraints, ParagraphStyle, SelectedTextStyle, SelectedTextStyles } from '@chili-publish/studio-sdk';
import { mock } from 'jest-mock-extended';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorSDK from '@chili-publish/studio-sdk';
import ParagraphStyleConstraint from '../../components/inlineTextEditingToolbar/desktop/paragraphStyleConstraint/ParagraphStyleConstraint';
import { renderWithProviders } from '../mocks/Provider';
import { getDataTestIdForSUI } from '../../utils/dataIds';

jest.mock('@chili-publish/studio-sdk');

describe('ParagraphStyleConstraint', () => {
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
            <ParagraphStyleConstraint
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

        const dropdown = screen.getByTestId(getDataTestIdForSUI('dropdown-paragraph-style-constraint'));
        expect(dropdown).toBeInTheDocument();

        await userEvent.click(dropdown);

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
            <ParagraphStyleConstraint
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

        const dropdown = screen.getByTestId(getDataTestIdForSUI('dropdown-paragraph-style-constraint'));
        expect(dropdown).toBeInTheDocument();

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
            <ParagraphStyleConstraint
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
            expect(screen.queryByText('Body Text')).not.toBeInTheDocument();
        });

        const user = userEvent.setup();
        const dropdown = screen.getByTestId(getDataTestIdForSUI('dropdown-paragraph-style-constraint'));

        await user.click(dropdown);

        await waitFor(() => {
            const bodyTextOption = screen.getByText('Body Text');
            expect(bodyTextOption).toBeInTheDocument();
        });

        await user.click(screen.getByText('Body Text'));

        await waitFor(() => {
            expect(mockSDK.textSelection.set).toHaveBeenCalledWith({
                [SelectedTextStyles.PARAGRAPH]: { value: 'style-2' },
            });
        });
    });
});

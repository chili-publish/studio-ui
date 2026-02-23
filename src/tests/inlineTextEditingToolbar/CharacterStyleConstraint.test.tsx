/* eslint-disable @typescript-eslint/no-explicit-any */
import { CharacterStyle, FrameConstraints, SelectedTextStyle, SelectedTextStyles } from '@chili-publish/studio-sdk';
import { mock } from 'jest-mock-extended';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorSDK from '@chili-publish/studio-sdk';
import { renderWithProviders } from '../mocks/Provider';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import CharacterStyleConstraint from 'src/components/inlineTextEditingToolbar/desktop/characterStyleConstraint/CharacterStyleConstraint';

jest.mock('@chili-publish/studio-sdk');

describe('CharacterStyleConstraint', () => {
    let mockSDK: ReturnType<typeof mock<EditorSDK>>;
    const mockCharacterStyle1: CharacterStyle = {
        id: 'style-1',
        name: 'Character Style 1',
    } as CharacterStyle;

    const mockCharacterStyle2: CharacterStyle = {
        id: 'style-2',
        name: 'Character Style 2',
    } as CharacterStyle;

    beforeEach(() => {
        mockSDK = mock<EditorSDK>();
        mockSDK.characterStyle = {
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
        (mockSDK.characterStyle.getById as jest.Mock)
            .mockResolvedValueOnce({ parsedData: mockCharacterStyle1 })
            .mockResolvedValueOnce({ parsedData: mockCharacterStyle2 });

        renderWithProviders(
            <CharacterStyleConstraint
                frameConstraints={
                    {
                        text: {
                            characterStyles: {
                                value: { allowed: true, ids: ['style-1', 'style-2'] },
                                isOverride: false,
                                isReadOnly: false,
                            },
                        },
                    } as unknown as FrameConstraints
                }
            />,
        );

        const dropdown = screen.getByTestId(getDataTestIdForSUI('dropdown-character-style-constraint'));
        expect(dropdown).toBeInTheDocument();

        await userEvent.click(dropdown);

        await waitFor(() => {
            expect(mockSDK.characterStyle.getById).toHaveBeenCalledTimes(2);
            expect(mockSDK.characterStyle.getById).toHaveBeenCalledWith('style-1');
            expect(mockSDK.characterStyle.getById).toHaveBeenCalledWith('style-2');
        });

        await waitFor(() => {
            expect(screen.getByText('Character Style 1')).toBeInTheDocument();
            expect(screen.getByText('Character Style 2')).toBeInTheDocument();
        });
    });

    it('should display the selected character style based on textStyle', async () => {
        (mockSDK.characterStyle.getById as jest.Mock)
            .mockResolvedValueOnce({ parsedData: mockCharacterStyle1 })
            .mockResolvedValueOnce({ parsedData: mockCharacterStyle2 });

        const selectedTextStyle: SelectedTextStyle = {
            characterStyleId: 'style-2',
        } as SelectedTextStyle;

        renderWithProviders(
            <CharacterStyleConstraint
                frameConstraints={
                    {
                        text: {
                            characterStyles: {
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

        const dropdown = screen.getByTestId(getDataTestIdForSUI('dropdown-character-style-constraint'));
        expect(dropdown).toBeInTheDocument();

        // The selected value should be style-2 (Character Style 2)
        await waitFor(() => {
            expect(screen.getByText('Character Style 2')).toBeInTheDocument();
        });
    });

    it('should call textSelection.set when a different style is selected', async () => {
        (mockSDK.characterStyle.getById as jest.Mock)
            .mockResolvedValueOnce({ parsedData: mockCharacterStyle1 })
            .mockResolvedValueOnce({ parsedData: mockCharacterStyle2 });

        const selectedTextStyle: SelectedTextStyle = {
            characterStyleId: 'style-1',
        } as SelectedTextStyle;

        renderWithProviders(
            <CharacterStyleConstraint
                frameConstraints={
                    {
                        text: {
                            characterStyles: {
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
            expect(screen.getByText('Character Style 1')).toBeInTheDocument();
            expect(screen.queryByText('Character Style 2')).not.toBeInTheDocument();
        });

        const user = userEvent.setup();
        const dropdown = screen.getByTestId(getDataTestIdForSUI('dropdown-character-style-constraint'));

        await user.click(dropdown);

        await waitFor(() => {
            const characterStyle2Option = screen.getByText('Character Style 2');
            expect(characterStyle2Option).toBeInTheDocument();
        });

        await user.click(screen.getByText('Character Style 2'));

        await waitFor(() => {
            expect(mockSDK.textSelection.set).toHaveBeenCalledWith({
                [SelectedTextStyles.CHARACTER]: { value: 'style-2' },
            });
        });
    });
});

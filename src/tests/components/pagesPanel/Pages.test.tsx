import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout, LayoutListItemType, Page } from '@chili-publish/studio-sdk';
import { renderWithProviders } from '@tests/mocks/Provider';
import { useAttachArrowKeysListener } from 'src/components/pagesPanel/useAttachArrowKeysListener';
import Pages from '../../../components/pagesPanel/Pages';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';

// Mock the hooks
jest.mock('../../../contexts/UiConfigContext', () => ({
    useUiConfigContext: jest.fn().mockReturnValue({
        uiOptions: {
            widgets: {
                bottomBar: {
                    visible: true,
                },
            },
        },
    }),
}));
jest.mock('src/core/hooks/useLeftPanelAndTrayVisibility', () => ({
    useLeftPanelAndTrayVisibility: jest.fn().mockReturnValue({
        shouldHide: false,
    }),
}));
jest.mock('../../../components/pagesPanel/usePageSnapshots', () => ({
    usePageSnapshots: jest.fn().mockReturnValue({
        pageSnapshots: [
            { id: 'page1', snapshot: { buffer: new ArrayBuffer(8) } },
            { id: 'page2', snapshot: { buffer: new ArrayBuffer(8) } },
        ],
    }),
}));
jest.mock('../../../components/pagesPanel/useAttachArrowKeysListener', () => ({
    useAttachArrowKeysListener: jest.fn().mockReturnValue({
        handleSelectPage: jest.fn(),
    }),
}));

const mockPages: Page[] = [
    { id: 'page1', name: 'Page 1', isVisible: true, number: 1, width: 100, height: 100 } as Page,
    { id: 'page2', name: 'Page 2', isVisible: true, number: 2, width: 100, height: 100 } as Page,
];

const mockLayoutDetails = {
    layouts: [] as LayoutListItemType[],
    selectedLayout: null as Layout | null,
    layoutSectionUIOptions: {
        visible: true,
        layoutSwitcherVisible: true,
        title: 'Layout',
    },
};

describe('Pages', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders pages correctly', () => {
        renderWithProviders(<Pages pages={mockPages} activePageId="page1" layoutDetails={mockLayoutDetails} />);

        const previewCards = screen.getAllByTestId('test-gsc-preview-card');
        const page1Card = previewCards.find((card) => card.id === 'page1');
        const page2Card = previewCards.find((card) => card.id === 'page2');

        expect(page1Card).toBeInTheDocument();
        expect(page2Card).toBeInTheDocument();

        // Check that createObjectURL was called for each page
        expect(window.URL.createObjectURL).toHaveBeenCalledTimes(mockPages.length);

        // Check that it was called with a Blob of type 'image/png'
        for (let i = 0; i < mockPages.length; i += 1) {
            const callArg = (window.URL.createObjectURL as jest.Mock).mock.calls[i][0];
            expect(callArg).toBeInstanceOf(Blob);
            expect(callArg.type).toBe('image/png');
        }
    });

    it('marks active page as selected', () => {
        renderWithProviders(<Pages pages={mockPages} activePageId="page2" layoutDetails={mockLayoutDetails} />);

        const previewCards = screen.getAllByTestId('test-gsc-preview-card');
        const page1Card = previewCards.find((card) => card.id === 'page1');
        const page2Card = previewCards.find((card) => card.id === 'page2');

        expect(page1Card).toBeInTheDocument();
        expect(page2Card).toBeInTheDocument();
    });

    it('handles page click', async () => {
        const user = userEvent.setup();
        const mockHandleSelectPage = jest.fn();
        (useAttachArrowKeysListener as jest.Mock).mockReturnValue({
            handleSelectPage: mockHandleSelectPage,
        });

        renderWithProviders(<Pages pages={mockPages} activePageId="page1" layoutDetails={mockLayoutDetails} />);

        const previewCards = screen.getAllByTestId('test-gsc-preview-card');
        const page2Card = previewCards.find((card) => card.id === 'page2');
        const clickableCard = within(page2Card!).getByTestId('test-gsc-card');
        await user.click(clickableCard);

        expect(mockHandleSelectPage).toHaveBeenCalledWith('page2');
    });

    it('does not render when bottom bar is hidden', () => {
        (useUiConfigContext as jest.Mock).mockReturnValue({
            uiOptions: {
                widgets: {
                    bottomBar: {
                        visible: false,
                    },
                },
            },
        } as ReturnType<typeof useUiConfigContext>);

        const { container } = renderWithProviders(
            <Pages pages={mockPages} activePageId="page1" layoutDetails={mockLayoutDetails} />,
        );

        expect(container.firstChild).toBeNull();
    });
});

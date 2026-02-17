import { Layout, LayoutListItemType } from '@chili-publish/studio-sdk';
import { renderHook } from '@testing-library/react';
import { useUserInterfaceDetailsContext } from '../../../components/navbar/UserInterfaceDetailsContext';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import { useLayoutSection } from '../../../core/hooks/useLayoutSection';

// Mock the UserInterfaceDetailsContext
jest.mock('../../../components/navbar/UserInterfaceDetailsContext', () => ({
    useUserInterfaceDetailsContext: jest.fn(),
}));

jest.mock('../../../contexts/UiConfigContext', () => ({
    useUiConfigContext: jest.fn(),
}));

describe('useLayoutSection', () => {
    const mockLayouts = [
        {
            id: '1',
            name: 'Layout 1',
            availableForUser: true,
            selectedByUser: false,
        },
        {
            id: '2',
            name: 'Layout 2',
            availableForUser: true,
            selectedByUser: false,
        },
        {
            id: '3',
            name: 'Layout 3',
            availableForUser: false,
            selectedByUser: false,
        },
    ] as LayoutListItemType[];

    const mockSelectedLayout = {
        id: '1',
        name: 'Layout 1',
        resizableByUser: {
            enabled: true,
        },
        availableForUser: true,
    } as Layout;

    const mockLayoutSectionUIOptions = {
        visible: true,
        title: 'Custom Title',
        layoutSwitcherVisible: true,
    };

    const defaultFormBuilder = {
        layouts: {
            active: true,
            header: 'Default Title',
            layoutSelector: true,
            showWidthHeightInputs: true,
            helpText: 'Help text content',
        },
    };

    beforeEach(() => {
        (useUserInterfaceDetailsContext as jest.Mock).mockReturnValue({
            formBuilder: defaultFormBuilder,
        });
        (useUiConfigContext as jest.Mock).mockReturnValue({
            projectConfig: {
                componentMode: undefined,
            },
        });
    });

    it('should return section title based on layoutSectionUIOptions', () => {
        const { result } = renderHook(() =>
            useLayoutSection({
                layouts: mockLayouts,
                selectedLayout: mockSelectedLayout,
                layoutSectionUIOptions: mockLayoutSectionUIOptions,
            }),
        );

        expect(result.current.sectionTitle).toBe('Custom Title');
    });

    it('should return section title based on form builder', () => {
        const { result } = renderHook(() =>
            useLayoutSection({
                layouts: mockLayouts,
                selectedLayout: mockSelectedLayout,
                layoutSectionUIOptions: { ...mockLayoutSectionUIOptions, title: undefined },
            }),
        );

        expect(result.current.sectionTitle).toBe('Default Title');
    });

    it('should show layout switcher when multiple layouts are available', () => {
        const { result } = renderHook(() =>
            useLayoutSection({
                layouts: mockLayouts,
                selectedLayout: mockSelectedLayout,
                layoutSectionUIOptions: mockLayoutSectionUIOptions,
            }),
        );

        expect(result.current.isLayoutSwitcherVisible).toBe(true);
    });

    it('should not show layout switcher when only one layout is available', () => {
        const singleLayout = [mockLayouts[0]];
        const { result } = renderHook(() =>
            useLayoutSection({
                layouts: singleLayout,
                selectedLayout: mockSelectedLayout,
                layoutSectionUIOptions: mockLayoutSectionUIOptions,
            }),
        );

        expect(result.current.isLayoutSwitcherVisible).toBe(false);
    });

    it('should not show layout switcher when layoutSwitcherVisibility is false via layoutSectionUIOptions', () => {
        const { result } = renderHook(() =>
            useLayoutSection({
                layouts: mockLayouts,
                selectedLayout: mockSelectedLayout,
                layoutSectionUIOptions: { ...mockLayoutSectionUIOptions, layoutSwitcherVisible: false },
            }),
        );

        expect(result.current.isLayoutSwitcherVisible).toBe(false);
    });

    it('should show resizable controls when layout is resizable', () => {
        const { result } = renderHook(() =>
            useLayoutSection({
                layouts: mockLayouts,
                selectedLayout: mockSelectedLayout,
                layoutSectionUIOptions: mockLayoutSectionUIOptions,
            }),
        );

        expect(result.current.isLayoutResizableVisible).toBe(true);
    });

    it('should not show resizable controls when layout is not resizable', () => {
        const nonResizableLayout = {
            ...mockSelectedLayout,
            resizableByUser: {
                enabled: false,
            },
        } as Layout;

        const { result } = renderHook(() =>
            useLayoutSection({
                layouts: mockLayouts,
                selectedLayout: nonResizableLayout,
                layoutSectionUIOptions: mockLayoutSectionUIOptions,
            }),
        );

        expect(result.current.isLayoutResizableVisible).toBe(false);
    });

    it('should show resizable controls when in component mode', () => {
        (useUiConfigContext as jest.Mock).mockReturnValue({
            projectConfig: {
                componentMode: true,
            },
        });
        const nonResizableLayout = {
            ...mockSelectedLayout,
            resizableByUser: {
                enabled: false,
            },
        } as Layout;

        const { result } = renderHook(() =>
            useLayoutSection({
                layouts: mockLayouts,
                selectedLayout: nonResizableLayout,
                layoutSectionUIOptions: mockLayoutSectionUIOptions,
            }),
        );

        expect(result.current.isLayoutResizableVisible).toBe(true);
    });

    it('should not show resizable controls when showWidthHeightInputs is false', () => {
        (useUserInterfaceDetailsContext as jest.Mock).mockReturnValue({
            formBuilder: {
                ...defaultFormBuilder,
                layouts: {
                    ...defaultFormBuilder.layouts,
                    showWidthHeightInputs: false,
                },
            },
        });

        const { result } = renderHook(() =>
            useLayoutSection({
                layouts: mockLayouts,
                selectedLayout: mockSelectedLayout,
                layoutSectionUIOptions: mockLayoutSectionUIOptions,
            }),
        );

        expect(result.current.isLayoutResizableVisible).toBe(false);
    });

    it('should not display layouts section when visibility is false', () => {
        const { result } = renderHook(() =>
            useLayoutSection({
                layouts: mockLayouts,
                selectedLayout: mockSelectedLayout,
                layoutSectionUIOptions: { ...mockLayoutSectionUIOptions, visible: false },
            }),
        );

        expect(result.current.isAvailableLayoutsDisplayed).toBe(false);
    });

    it('should not display layouts section when formBuilder layouts are not active', () => {
        (useUserInterfaceDetailsContext as jest.Mock).mockReturnValue({
            formBuilder: {
                ...defaultFormBuilder,
                layouts: {
                    ...defaultFormBuilder.layouts,
                    active: false,
                },
            },
        });

        const { result } = renderHook(() =>
            useLayoutSection({
                layouts: mockLayouts,
                selectedLayout: mockSelectedLayout,
                layoutSectionUIOptions: mockLayoutSectionUIOptions,
            }),
        );

        expect(result.current.isAvailableLayoutsDisplayed).toBe(false);
    });

    it('should display layouts section when either switcher or resizable controls are visible', () => {
        const { result } = renderHook(() =>
            useLayoutSection({
                layouts: mockLayouts,
                selectedLayout: mockSelectedLayout,
                layoutSectionUIOptions: mockLayoutSectionUIOptions,
            }),
        );

        expect(result.current.isAvailableLayoutsDisplayed).toBe(true);
    });
});

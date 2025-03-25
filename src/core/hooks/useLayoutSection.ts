import { Layout, LayoutListItemType } from '@chili-publish/studio-sdk';
import { useMemo } from 'react';
import { useUserInterfaceDetailsContext } from '../../components/navbar/UserInterfaceDetailsContext';
import { defaultUiOptions, UiOptions } from '../../types/types';

interface UseLayoutSectionProps {
    layouts: LayoutListItemType[];
    selectedLayout: Layout | null;
    layoutSectionUIOptions: UiOptions['layoutSection'] & { visible: boolean };
}

export function useLayoutSection({ layouts, selectedLayout, layoutSectionUIOptions }: UseLayoutSectionProps) {
    const { layoutsFormBuilderData } = useUserInterfaceDetailsContext();

    const availableLayouts = useMemo(() => layouts.filter((item) => item.availableForUser), [layouts]);

    const layoutsSectionIsVisible = useMemo(
        () => layoutsFormBuilderData?.active ?? layoutSectionUIOptions?.visible,
        [layoutSectionUIOptions?.visible, layoutsFormBuilderData],
    );

    const sectionTitle = useMemo(
        () => layoutsFormBuilderData?.header ?? layoutSectionUIOptions?.title ?? defaultUiOptions.layoutSection.title,
        [layoutSectionUIOptions?.title, layoutsFormBuilderData],
    );
    const layoutSwitcherVisibility = useMemo(
        () =>
            layoutsFormBuilderData?.layoutSelector ??
            layoutSectionUIOptions?.layoutSwitcherVisible ??
            defaultUiOptions.layoutSection.layoutSwitcherVisible,
        [layoutSectionUIOptions?.layoutSwitcherVisible, layoutsFormBuilderData],
    );

    const isLayoutSwitcherVisible = useMemo(
        () => availableLayouts.length >= 2 && layoutSwitcherVisibility,
        [availableLayouts.length, layoutSwitcherVisibility],
    );

    const isLayoutResizableVisible = useMemo(
        () =>
            !!(selectedLayout?.id && selectedLayout?.resizableByUser?.enabled) &&
            layoutsFormBuilderData?.showWidthHeightInputs,
        [selectedLayout, layoutsFormBuilderData],
    );
    const isAvailableLayoutsDisplayed = useMemo(() => {
        if (layoutsSectionIsVisible !== undefined) {
            if (layoutsSectionIsVisible) return isLayoutSwitcherVisible || !!isLayoutResizableVisible;
            return false;
        }
        return layoutSwitcherVisibility;
    }, [isLayoutSwitcherVisible, isLayoutResizableVisible, layoutsSectionIsVisible, layoutSwitcherVisibility]);

    return {
        availableLayouts,
        isLayoutSwitcherVisible,
        isLayoutResizableVisible,
        isAvailableLayoutsDisplayed,
        sectionTitle,
        layoutsFormBuilderData,
        helpText: layoutsFormBuilderData?.helpText,
    };
}

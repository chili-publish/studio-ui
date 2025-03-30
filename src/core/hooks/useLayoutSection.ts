import { Layout, LayoutListItemType } from '@chili-publish/studio-sdk';
import { useMemo } from 'react';
import { FormBuilderType, UiOptions } from '../../types/types';

interface UseLayoutSectionProps {
    layouts: LayoutListItemType[];
    selectedLayout: Layout | null;
    layoutSectionUIOptions: UiOptions['layoutSection'] & { visible: boolean };
    formBuilder?: FormBuilderType;
}
const defaultFallbackLayoutSection = {
    layoutSwitcherVisible: true,
    title: 'Layout',
};

export function useLayoutSection({
    layouts,
    selectedLayout,
    layoutSectionUIOptions,
    formBuilder,
}: UseLayoutSectionProps) {
    const availableLayouts = useMemo(() => layouts.filter((item) => item.availableForUser), [layouts]);

    const layoutsSectionIsVisible = useMemo(
        () => formBuilder?.layouts?.active ?? layoutSectionUIOptions?.visible,
        [layoutSectionUIOptions?.visible, formBuilder?.layouts],
    );

    const sectionTitle = useMemo(
        () => formBuilder?.layouts?.header ?? layoutSectionUIOptions?.title ?? defaultFallbackLayoutSection.title,
        [layoutSectionUIOptions?.title, formBuilder?.layouts],
    );
    const layoutSwitcherVisibility = useMemo(
        () =>
            formBuilder?.layouts?.layoutSelector ??
            layoutSectionUIOptions?.layoutSwitcherVisible ??
            defaultFallbackLayoutSection.layoutSwitcherVisible,
        [layoutSectionUIOptions?.layoutSwitcherVisible, formBuilder?.layouts],
    );

    const isLayoutSwitcherVisible = useMemo(
        () => availableLayouts.length >= 2 && layoutSwitcherVisibility,
        [availableLayouts.length, layoutSwitcherVisibility],
    );

    const isLayoutResizableVisible = useMemo(
        () =>
            !!(selectedLayout?.id && selectedLayout?.resizableByUser?.enabled) &&
            formBuilder?.layouts?.showWidthHeightInputs,
        [selectedLayout, formBuilder?.layouts],
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
        helpText: formBuilder?.layouts?.helpText,
    };
}

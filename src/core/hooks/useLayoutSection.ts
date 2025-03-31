import { Layout, LayoutListItemType } from '@chili-publish/studio-sdk';
import { useMemo } from 'react';
import { UiOptions } from '../../types/types';
import { useUserInterfaceDetailsContext } from '../../components/navbar/UserInterfaceDetailsContext';

interface UseLayoutSectionProps {
    layouts: LayoutListItemType[];
    selectedLayout: Layout | null;
    layoutSectionUIOptions: UiOptions['layoutSection'] & { visible: boolean };
}

export function useLayoutSection({ layouts, selectedLayout, layoutSectionUIOptions }: UseLayoutSectionProps) {
    const { formBuilder } = useUserInterfaceDetailsContext();
    const availableLayouts = useMemo(() => layouts?.filter((item) => item.availableForUser), [layouts]);

    const hasLayoutSectionUIOptions = useMemo(
        () =>
            [layoutSectionUIOptions.title, layoutSectionUIOptions.layoutSwitcherVisible].every((value) =>
                Boolean(value),
            ),
        [layoutSectionUIOptions],
    );

    const layoutsSectionIsVisible = useMemo(
        () => (hasLayoutSectionUIOptions ? layoutSectionUIOptions?.visible : formBuilder.layouts?.active),
        [hasLayoutSectionUIOptions, layoutSectionUIOptions, formBuilder.layouts],
    );
    const sectionTitle = useMemo(
        () => layoutSectionUIOptions?.title ?? formBuilder.layouts?.header,
        [layoutSectionUIOptions?.title, formBuilder.layouts],
    );
    const layoutSwitcherVisibility = useMemo(
        () => layoutSectionUIOptions?.layoutSwitcherVisible ?? formBuilder.layouts?.layoutSelector,
        [layoutSectionUIOptions?.layoutSwitcherVisible, formBuilder.layouts],
    );

    const isLayoutSwitcherVisible = useMemo(
        () => availableLayouts?.length >= 2 && layoutSwitcherVisibility,
        [availableLayouts?.length, layoutSwitcherVisibility],
    );

    const isLayoutResizableVisible = useMemo(
        () =>
            !hasLayoutSectionUIOptions &&
            !!(selectedLayout?.id && selectedLayout?.resizableByUser?.enabled) &&
            formBuilder.layouts?.showWidthHeightInputs,
        [selectedLayout, formBuilder.layouts, hasLayoutSectionUIOptions],
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
        helpText: formBuilder.layouts?.helpText,
    };
}

import { Layout, LayoutListItemType } from '@chili-publish/studio-sdk';
import { useMemo } from 'react';
import { useUserInterfaceDetailsContext } from '../../components/navbar/UserInterfaceDetailsContext';
import { UiOptions } from '../../types/types';

interface UseLayoutSectionProps {
    layouts: LayoutListItemType[];
    selectedLayout: Layout | null;
    layoutSectionUIOptions: UiOptions['layoutSection'] & { visible: boolean };
}

export function useLayoutSection({ layouts, selectedLayout, layoutSectionUIOptions }: UseLayoutSectionProps) {
    const { formBuilder } = useUserInterfaceDetailsContext();
    const availableLayouts = useMemo(() => layouts?.filter((item) => item.availableForUser), [layouts]);

    const layoutsSectionVisibility = useMemo(
        () => layoutSectionUIOptions.visible && formBuilder.layouts?.active,
        [layoutSectionUIOptions.visible, formBuilder.layouts],
    );
    const sectionTitle = useMemo(
        () => layoutSectionUIOptions?.title ?? formBuilder.layouts?.header,
        [layoutSectionUIOptions?.title, formBuilder.layouts],
    );
    const layoutSwitcherVisibility = useMemo(
        () => layoutSectionUIOptions?.layoutSwitcherVisible ?? formBuilder.layouts?.layoutSelector,
        [layoutSectionUIOptions?.layoutSwitcherVisible, formBuilder.layouts],
    );

    const layoutResizableVisibility = useMemo(() => formBuilder.layouts?.showWidthHeightInputs, [formBuilder.layouts]);

    const helpText = useMemo(() => formBuilder.layouts?.helpText, [formBuilder.layouts]);

    const isLayoutSwitcherVisible = useMemo(
        () => availableLayouts?.length >= 2 && layoutSwitcherVisibility,
        [availableLayouts?.length, layoutSwitcherVisibility],
    );

    const isLayoutResizableVisible = useMemo(
        () => selectedLayout?.id && selectedLayout?.resizableByUser?.enabled && layoutResizableVisibility,
        [selectedLayout, layoutResizableVisibility],
    );

    const isAvailableLayoutsDisplayed = useMemo(() => {
        if (!layoutsSectionVisibility) {
            return false;
        }
        return isLayoutSwitcherVisible || !!isLayoutResizableVisible;
    }, [layoutsSectionVisibility, isLayoutSwitcherVisible, isLayoutResizableVisible]);

    return {
        availableLayouts,
        isLayoutSwitcherVisible,
        isLayoutResizableVisible,
        isAvailableLayoutsDisplayed,
        sectionTitle,
        helpText,
    };
}

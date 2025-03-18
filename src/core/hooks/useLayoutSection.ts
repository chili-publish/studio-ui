import { Layout, LayoutListItemType } from '@chili-publish/studio-sdk';
import { useMemo } from 'react';
import { useOutputSettingsContext } from '../../components/navbar/OutputSettingsContext';
import { defaultUiOptions, UiOptions } from '../../types/types';

interface UseLayoutSectionProps {
    layouts: LayoutListItemType[];
    selectedLayout: Layout | null;
    layoutSectionUIOptions: UiOptions['layoutSection'] & { visible: boolean };
}

export function useLayoutSection({ layouts, selectedLayout, layoutSectionUIOptions }: UseLayoutSectionProps) {
    const { layoutsFormBuilderData } = useOutputSettingsContext();

    const availableLayouts = useMemo(() => layouts.filter((item) => item.availableForUser), [layouts]);

    const layoutSwitcherVisibility = useMemo(
        () =>
            layoutSectionUIOptions.layoutSwitcherVisible ??
            layoutsFormBuilderData?.layoutSelector ??
            defaultUiOptions.layoutSection.layoutSwitcherVisible,
        [layoutSectionUIOptions.layoutSwitcherVisible, layoutsFormBuilderData?.layoutSelector],
    );

    const layoutsSectionIsVisible = useMemo(
        () => layoutSectionUIOptions.visible && layoutsFormBuilderData?.active,
        [layoutSectionUIOptions.visible, layoutsFormBuilderData?.active],
    );

    const isLayoutSwitcherVisible = useMemo(
        () => availableLayouts.length >= 2 && layoutSwitcherVisibility,
        [availableLayouts.length, layoutSwitcherVisibility],
    );

    const isLayoutResizableVisible = useMemo(
        () =>
            !!(selectedLayout?.id && selectedLayout?.resizableByUser?.enabled) &&
            layoutsFormBuilderData?.showWidthHeightInputs,
        [selectedLayout, layoutsFormBuilderData?.showWidthHeightInputs],
    );

    const isAvailableLayoutsDisplayed = useMemo(() => {
        if (layoutsSectionIsVisible !== undefined) {
            if (layoutsSectionIsVisible) return isLayoutSwitcherVisible || !!isLayoutResizableVisible;
            return false;
        }
        return layoutSwitcherVisibility;
    }, [isLayoutSwitcherVisible, isLayoutResizableVisible, layoutsSectionIsVisible, layoutSwitcherVisibility]);

    const sectionTitle = useMemo(
        () => layoutSectionUIOptions.title || layoutsFormBuilderData?.header || defaultUiOptions.layoutSection.title,
        [layoutSectionUIOptions.title, layoutsFormBuilderData?.header],
    );
    // eslint-disable-next-line
    console.log('title', [
        layoutSectionUIOptions.title,
        layoutsFormBuilderData?.header,
        defaultUiOptions.layoutSection.title,
    ]);
    // eslint-disable-next-line
    console.log('layoutSwitcherVisibility', [
        layoutSectionUIOptions.layoutSwitcherVisible,
        layoutsFormBuilderData?.layoutSelector,
        defaultUiOptions.layoutSection.layoutSwitcherVisible,
    ]);

    return {
        availableLayouts,
        isLayoutSwitcherVisible,
        isLayoutResizableVisible,
        isAvailableLayoutsDisplayed,
        sectionTitle,
        layoutsFormBuilderData,
    };
}

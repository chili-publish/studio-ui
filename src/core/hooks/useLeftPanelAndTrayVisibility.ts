import { Layout, LayoutListItemType } from '@chili-publish/studio-sdk';
import { useMemo } from 'react';
import { UiOptions } from '../../types/types';
import { useAppContext } from '../../contexts/AppProvider';
import { useLayoutSection } from './useLayoutSection';
import { useUserInterfaceDetailsContext } from '../../components/navbar/UserInterfaceDetailsContext';

interface UseLeftPanelAndTrayVisibilityProps {
    layouts: LayoutListItemType[];
    selectedLayout: Layout | null;
    layoutSectionUIOptions: UiOptions['layoutSection'] & { visible: boolean };
}
export const useLeftPanelAndTrayVisibility = ({
    layouts,
    selectedLayout,
    layoutSectionUIOptions,
}: UseLeftPanelAndTrayVisibilityProps) => {
    const { formBuilder } = useUserInterfaceDetailsContext();
    const { dataSource } = useAppContext();
    const layoutSection = useLayoutSection({ layouts, selectedLayout, layoutSectionUIOptions });

    const isDataSourceDisplayed = useMemo(
        () => formBuilder.datasource.active && !!dataSource,
        [formBuilder.datasource.active, dataSource],
    );

    const shouldHide = useMemo(
        () =>
            [isDataSourceDisplayed, formBuilder.variables.active, layoutSection.isAvailableLayoutsDisplayed].every(
                (v) => !v,
            ),
        [isDataSourceDisplayed, formBuilder.variables.active, layoutSection.isAvailableLayoutsDisplayed],
    );
    return { shouldHide, isDataSourceDisplayed, layoutSection };
};

import { ScrollbarWrapper } from '@chili-publish/grafx-shared-components';
import { Layout, LayoutListItemType, LayoutPropertiesType, PageSize, Variable } from '@chili-publish/studio-sdk';
import { useMemo } from 'react';
import { useFeatureFlagContext } from '../../../contexts/FeatureFlagProvider';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { ContentType } from '../../../contexts/VariablePanelContext.types';
import { defaultUiOptions, UiOptions } from '../../../types/types';
import DataSource from '../../dataSource/DataSource';
import ImagePanel from '../../imagePanel/ImagePanel';
import LayoutProperties from '../../LayoutPanel/LayoutProperties';
import { PanelTitle, SectionHelpText, SectionWrapper } from '../../shared/Panel.styles';
import VariablesList from '../../variables/VariablesList';
import AvailableLayouts from './AvailableLayouts';
import { ImagePanelContainer, LeftPanelContainer, LeftPanelWrapper } from './LeftPanel.styles';
import { useOutputSettingsContext } from '../../navbar/OutputSettingsContext';

interface LeftPanelProps {
    variables: Variable[];

    selectedLayout: Layout | null;
    layouts: LayoutListItemType[];
    layoutPropertiesState: LayoutPropertiesType;
    layoutSectionUIOptions: UiOptions['layoutSection'] & { visible: boolean };
    pageSize?: PageSize;
}

function LeftPanel({
    variables,
    selectedLayout,
    layouts,
    layoutPropertiesState,
    pageSize,
    layoutSectionUIOptions,
}: LeftPanelProps) {
    const { contentType } = useVariablePanelContext();
    const { featureFlags } = useFeatureFlagContext();

    const { layoutsFormBuilderData } = useOutputSettingsContext();
    const availableLayouts = useMemo(() => layouts.filter((item) => item.availableForUser), [layouts]);

    const layoutSwitcherVisibility = useMemo(() => {
        if (layoutSectionUIOptions.layoutSwitcherVisible !== undefined)
            return layoutSectionUIOptions.layoutSwitcherVisible;
        if (layoutsFormBuilderData?.layoutSelector !== undefined) return layoutsFormBuilderData.layoutSelector;

        return defaultUiOptions.layoutSection.layoutSwitcherVisible;
    }, [layoutSectionUIOptions.layoutSwitcherVisible, layoutsFormBuilderData?.layoutSelector]);

    const layoutsSectionIsVisible = useMemo(
        () => layoutSectionUIOptions.visible && layoutsFormBuilderData?.active,
        [layoutSectionUIOptions.visible, layoutsFormBuilderData?.active],
    );
    const isLayoutSwitcherVisible = availableLayouts.length >= 2 && layoutSwitcherVisibility;

    const isLayoutResizableVisible =
        !!(selectedLayout?.id && selectedLayout?.resizableByUser.enabled) &&
        layoutsFormBuilderData?.showWidthHeightInputs;

    const isAvailableLayoutsDisplayed = useMemo(() => {
        if (layoutsSectionIsVisible !== undefined) {
            if (layoutsSectionIsVisible) {
                if (isLayoutSwitcherVisible || isLayoutResizableVisible) return true;
            }
            return false;
        }

        return layoutSwitcherVisibility;
    }, [isLayoutSwitcherVisible, isLayoutResizableVisible, layoutsSectionIsVisible, layoutSwitcherVisibility]);

    const sectionTitle = useMemo(
        () => layoutSectionUIOptions.title || layoutsFormBuilderData?.header || defaultUiOptions.layoutSection.title,
        [layoutSectionUIOptions.title, layoutsFormBuilderData?.header],
    );
    return (
        <LeftPanelWrapper id="left-panel" overflowScroll={contentType !== ContentType.IMAGE_PANEL}>
            <ScrollbarWrapper data-intercom-target="Customize panel">
                <LeftPanelContainer hidden={contentType === ContentType.IMAGE_PANEL}>
                    {featureFlags?.studioDataSource ? <DataSource /> : null}
                    {isAvailableLayoutsDisplayed && (
                        <>
                            <SectionWrapper id="layout-section-header">
                                <PanelTitle margin="0">{sectionTitle}</PanelTitle>
                                {layoutsFormBuilderData?.helpText && (
                                    <SectionHelpText>{layoutsFormBuilderData?.helpText}</SectionHelpText>
                                )}
                            </SectionWrapper>
                            {isLayoutSwitcherVisible && (
                                <AvailableLayouts
                                    selectedLayout={selectedLayout}
                                    availableForUserLayouts={availableLayouts}
                                />
                            )}
                            {isLayoutResizableVisible && (
                                <LayoutProperties layout={layoutPropertiesState} pageSize={pageSize} />
                            )}
                        </>
                    )}

                    <VariablesList variables={variables} />
                </LeftPanelContainer>

                <ImagePanelContainer hidden={contentType !== ContentType.IMAGE_PANEL}>
                    <ImagePanel />
                </ImagePanelContainer>
            </ScrollbarWrapper>
        </LeftPanelWrapper>
    );
}

export default LeftPanel;

import { ScrollbarWrapper } from '@chili-publish/grafx-shared-components';
import { Layout, LayoutListItemType, LayoutPropertiesType, PageSize, Variable } from '@chili-publish/studio-sdk';
import { useFeatureFlagContext } from '../../../contexts/FeatureFlagProvider';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { ContentType } from '../../../contexts/VariablePanelContext.types';
import { UiOptions } from '../../../types/types';
import DataSource from '../../dataSource/DataSource';
import ImagePanel from '../../imagePanel/ImagePanel';
import LayoutProperties from '../../LayoutPanel/LayoutProperties';
import { PanelTitle, SectionHelpText, SectionWrapper } from '../../shared/Panel.styles';
import VariablesList from '../../variables/VariablesList';
import AvailableLayouts from './AvailableLayouts';
import { ImagePanelContainer, LeftPanelContainer, LeftPanelWrapper } from './LeftPanel.styles';
import { useLayoutSection } from '../../../core/hooks/useLayoutSection';

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
    const {
        availableLayouts,
        isLayoutSwitcherVisible,
        isLayoutResizableVisible,
        isAvailableLayoutsDisplayed,
        sectionTitle,
        layoutsFormBuilderData,
    } = useLayoutSection({ layouts, selectedLayout, layoutSectionUIOptions });

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

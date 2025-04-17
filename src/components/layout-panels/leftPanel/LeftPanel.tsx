import { ScrollbarWrapper } from '@chili-publish/grafx-shared-components';
import { Layout, LayoutListItemType, LayoutPropertiesType, PageSize, Variable } from '@chili-publish/studio-sdk';
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
import { useUserInterfaceDetailsContext } from '../../navbar/UserInterfaceDetailsContext';

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
    const { formBuilder } = useUserInterfaceDetailsContext();
    const {
        availableLayouts,
        isLayoutSwitcherVisible,
        isLayoutResizableVisible,
        isAvailableLayoutsDisplayed,
        sectionTitle,
        helpText,
    } = useLayoutSection({ layouts, selectedLayout, layoutSectionUIOptions });

    return (
        <LeftPanelWrapper id="left-panel" overflowScroll={contentType !== ContentType.IMAGE_PANEL}>
            <ScrollbarWrapper data-intercom-target="Customize panel">
                <LeftPanelContainer hidden={contentType === ContentType.IMAGE_PANEL}>
                    {formBuilder.datasource.active && <DataSource />}
                    {isAvailableLayoutsDisplayed && (
                        <>
                            <SectionWrapper id="layout-section-header">
                                <PanelTitle margin="0">{sectionTitle}</PanelTitle>
                                {helpText && <SectionHelpText>{helpText}</SectionHelpText>}
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

                    {formBuilder.variables.active && <VariablesList variables={variables} />}
                </LeftPanelContainer>

                {formBuilder.variables.active && (
                    <ImagePanelContainer hidden={contentType !== ContentType.IMAGE_PANEL}>
                        <ImagePanel />
                    </ImagePanelContainer>
                )}
            </ScrollbarWrapper>
        </LeftPanelWrapper>
    );
}

export default LeftPanel;

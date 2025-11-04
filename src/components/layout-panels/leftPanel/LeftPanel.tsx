import { ScrollbarWrapper } from '@chili-publish/grafx-shared-components';
import { Layout, LayoutListItemType, LayoutPropertiesType, PageSize } from '@chili-publish/studio-sdk';
import { useSelector } from 'react-redux';
import { useLeftPanelAndTrayVisibility } from '../../../core/hooks/useLeftPanelAndTrayVisibility';
import { useUITranslations } from '../../../core/hooks/useUITranslations';
import { UiOptions } from '../../../types/types';
import DataSource from '../../dataSource/DataSource';
import ImagePanel from '../../imagePanel/ImagePanel';
import LayoutProperties from '../../layoutProperties/LayoutProperties';
import { useUserInterfaceDetailsContext } from '../../navbar/UserInterfaceDetailsContext';
import { PanelTitle, SectionHelpText, SectionWrapper } from '../../shared/Panel.styles';
import VariablesList from '../../variables/VariablesList';
import AvailableLayouts from './AvailableLayouts';
import { ImagePanelContainer, LeftPanelContainer, LeftPanelWrapper } from './LeftPanel.styles';
import { PanelType, selectActivePanel } from '../../../store/reducers/panelReducer';

interface LeftPanelProps {
    selectedLayout: Layout | null;
    layouts: LayoutListItemType[];
    layoutPropertiesState: LayoutPropertiesType;
    layoutSectionUIOptions: UiOptions['layoutSection'] & { visible: boolean };
    pageSize?: PageSize;
}

function LeftPanel({
    selectedLayout,
    layouts,
    layoutPropertiesState,
    pageSize,
    layoutSectionUIOptions,
}: LeftPanelProps) {
    const activePanel = useSelector(selectActivePanel);
    const {
        shouldHide: shouldHideLeftPanel,
        layoutSection: {
            availableLayouts,
            isLayoutSwitcherVisible,
            isLayoutResizableVisible,
            isAvailableLayoutsDisplayed,
            sectionTitle,
            helpText,
        },
        isDataSourceDisplayed,
    } = useLeftPanelAndTrayVisibility({ layouts, selectedLayout, layoutSectionUIOptions });

    const { formBuilder } = useUserInterfaceDetailsContext();
    const { getUITranslation } = useUITranslations();

    const layoutsHeader = getUITranslation(['formBuilder', 'layouts', 'header'], sectionTitle);
    const layoutsHelpText = getUITranslation(['formBuilder', 'layouts', 'helpText'], helpText);

    return !shouldHideLeftPanel ? (
        <LeftPanelWrapper
            data-testid="test-sui-left-panel"
            id="left-panel"
            overflowScroll={activePanel !== PanelType.IMAGE_PANEL}
        >
            <ScrollbarWrapper data-intercom-target="Customize panel">
                {activePanel === PanelType.IMAGE_PANEL && (
                    <ImagePanelContainer>
                        <ImagePanel />
                    </ImagePanelContainer>
                )}
                <LeftPanelContainer isHidden={activePanel === PanelType.IMAGE_PANEL}>
                    {isDataSourceDisplayed && <DataSource />}
                    {isAvailableLayoutsDisplayed && (
                        <>
                            <SectionWrapper id="layout-section-header">
                                <PanelTitle margin="0">{layoutsHeader}</PanelTitle>
                                {layoutsHelpText && <SectionHelpText>{layoutsHelpText}</SectionHelpText>}
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

                    {formBuilder.variables.active && <VariablesList />}
                </LeftPanelContainer>
            </ScrollbarWrapper>
        </LeftPanelWrapper>
    ) : null;
}

export default LeftPanel;

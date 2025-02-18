import { ScrollbarWrapper } from '@chili-publish/grafx-shared-components';
import { Layout, LayoutListItemType, LayoutPropertiesType, Page, Variable } from '@chili-publish/studio-sdk';
import { useMemo } from 'react';
import { useFeatureFlagContext } from '../../../contexts/FeatureFlagProvider';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { ContentType } from '../../../contexts/VariablePanelContext.types';
import { UiOptions } from '../../../types/types';
import DataSource from '../../dataSource/DataSource';
import ImagePanel from '../../imagePanel/ImagePanel';
import LayoutProperties from '../../LayoutPanel/LayoutProperties';
import { PanelTitle } from '../../shared/Panel.styles';
import VariablesList from '../../variables/VariablesList';
import AvailableLayouts from './AvailableLayouts';
import { ImagePanelContainer, LeftPanelContainer, LeftPanelWrapper } from './LeftPanel.styles';

interface LeftPanelProps {
    variables: Variable[];

    selectedLayout: Layout | null;
    layouts: LayoutListItemType[];
    layoutPropertiesState: LayoutPropertiesType;
    layoutSectionUIOptions: Required<Required<Required<UiOptions>['widgets']>['layoutSection']>;
    activePageDetails?: Page;
}

function LeftPanel({
    variables,
    selectedLayout,
    layouts,
    layoutPropertiesState,
    activePageDetails,
    layoutSectionUIOptions,
}: LeftPanelProps) {
    const { contentType } = useVariablePanelContext();
    const { featureFlags } = useFeatureFlagContext();
    const availableLayouts = useMemo(() => layouts.filter((item) => item.availableForUser), [layouts]);
    const isAvailableLayoutsDisplayed =
        layoutSectionUIOptions.visible &&
        (availableLayouts.length >= 2 || !!(selectedLayout?.id && selectedLayout?.resizableByUser.enabled));
    return (
        <LeftPanelWrapper id="left-panel" overflowScroll={contentType !== ContentType.IMAGE_PANEL}>
            <ScrollbarWrapper data-intercom-target="Customize panel">
                <LeftPanelContainer hidden={contentType === ContentType.IMAGE_PANEL}>
                    {featureFlags?.studioDataSource ? <DataSource /> : null}
                    {isAvailableLayoutsDisplayed && (
                        <>
                            <PanelTitle>{layoutSectionUIOptions.title}</PanelTitle>
                            {availableLayouts.length >= 2 && (
                                <AvailableLayouts
                                    selectedLayout={selectedLayout}
                                    availableForUserLayouts={availableLayouts}
                                />
                            )}
                            {selectedLayout?.id && selectedLayout?.resizableByUser.enabled && (
                                <LayoutProperties
                                    layout={layoutPropertiesState}
                                    activePageDetails={activePageDetails}
                                />
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

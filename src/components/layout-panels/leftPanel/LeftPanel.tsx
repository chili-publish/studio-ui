import { ScrollbarWrapper } from '@chili-publish/grafx-shared-components';
import { Layout, LayoutListItemType, LayoutPropertiesType, Variable } from '@chili-publish/studio-sdk';
import { useMemo } from 'react';
import { useFeatureFlagContext } from '../../../contexts/FeatureFlagProvider';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { ContentType } from '../../../contexts/VariablePanelContext.types';
import DataSource from '../../dataSource/DataSource';
import ImagePanel from '../../imagePanel/ImagePanel';
import VariablesList from '../../variables/VariablesList';
import { ImagePanelContainer, LeftPanelWrapper, LeftPanelContainer } from './LeftPanel.styles';
import AvailableLayouts from './AvailableLayouts';
import { PanelTitle } from '../../shared/Panel.styles';
import LayoutProperties from '../../LayoutPanel/LayoutProperties';

interface LeftPanelProps {
    variables: Variable[];

    selectedLayout: Layout | null;
    layouts: LayoutListItemType[];
    layoutPropertiesState: LayoutPropertiesType;
}

function LeftPanel({ variables, selectedLayout, layouts, layoutPropertiesState }: LeftPanelProps) {
    const { contentType } = useVariablePanelContext();
    const { featureFlags } = useFeatureFlagContext();
    const availableLayouts = useMemo(() => layouts.filter((item) => item.availableForUser), [layouts]);
    return (
        <LeftPanelWrapper id="left-panel" overflowScroll={contentType !== ContentType.IMAGE_PANEL}>
            <ScrollbarWrapper data-intercom-target="Customize panel">
                <LeftPanelContainer hidden={contentType === ContentType.IMAGE_PANEL}>
                    {featureFlags?.studioDataSource ? <DataSource /> : null}
                    {(availableLayouts.length >= 2 ||
                        (selectedLayout?.id && selectedLayout?.resizableByUser?.enabled)) && (
                        <>
                            <PanelTitle>Layout</PanelTitle>
                            {availableLayouts.length >= 2 && (
                                <AvailableLayouts
                                    selectedLayout={selectedLayout}
                                    availableForUserLayouts={availableLayouts}
                                />
                            )}
                            {selectedLayout?.id && selectedLayout?.resizableByUser?.enabled && (
                                <LayoutProperties layout={layoutPropertiesState} />
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

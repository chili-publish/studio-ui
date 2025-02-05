import { ScrollbarWrapper } from '@chili-publish/grafx-shared-components';
import { Layout, LayoutListItemType, Variable } from '@chili-publish/studio-sdk';
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

interface LeftPanelProps {
    variables: Variable[];

    selectedLayout: Layout | null;
    layouts: LayoutListItemType[];
}

function LeftPanel({ variables, selectedLayout, layouts }: LeftPanelProps) {
    const { contentType } = useVariablePanelContext();
    const { featureFlags } = useFeatureFlagContext();
    const availableLayouts = useMemo(() => layouts.filter((item) => item.availableForUser), [layouts]);

    return (
        <LeftPanelWrapper id="left-panel" overflowScroll={contentType !== ContentType.IMAGE_PANEL}>
            <ScrollbarWrapper data-intercom-target="Customize panel">
                <LeftPanelContainer hidden={contentType === ContentType.IMAGE_PANEL}>
                    {featureFlags?.STUDIO_DATA_SOURCE ? <DataSource /> : null}
                    {availableLayouts.length >= 2 && (
                        <>
                            <PanelTitle>Layout</PanelTitle>
                            <AvailableLayouts
                                selectedLayout={selectedLayout}
                                availableForUserLayouts={availableLayouts}
                            />
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

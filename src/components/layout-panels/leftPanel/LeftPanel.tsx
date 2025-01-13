import { ScrollbarWrapper, useTheme } from '@chili-publish/grafx-shared-components';
import { Variable } from '@chili-publish/studio-sdk';
import { useFeatureFlagContext } from '../../../contexts/FeatureFlagProvider';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { ContentType } from '../../../contexts/VariablePanelContext.types';
import DataSource from '../../dataSource/DataSource';
import ImagePanel from '../../imagePanel/ImagePanel';
import VariablesList from '../../variables/VariablesList';
import { ImagePanelContainer, LeftPanelContainer, VariablesListContainer } from './LeftPanel.styles';

interface LeftPanelProps {
    variables: Variable[];
}

function LeftPanel({ variables }: LeftPanelProps) {
    const { contentType } = useVariablePanelContext();
    const { panel } = useTheme();
    const { featureFlags } = useFeatureFlagContext();

    return (
        <LeftPanelContainer
            id="left-panel"
            data-intercom-target="Customize panel"
            overflowScroll={contentType !== ContentType.IMAGE_PANEL}
            panelTheme={panel}
        >
            <ScrollbarWrapper>
                <VariablesListContainer hidden={contentType === ContentType.IMAGE_PANEL}>
                    {featureFlags?.STUDIO_DATA_SOURCE ? <DataSource /> : null}
                    <VariablesList variables={variables} />
                </VariablesListContainer>

                <ImagePanelContainer hidden={contentType !== ContentType.IMAGE_PANEL}>
                    <ImagePanel />
                </ImagePanelContainer>
            </ScrollbarWrapper>
        </LeftPanelContainer>
    );
}

export default LeftPanel;

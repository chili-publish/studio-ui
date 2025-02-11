import { ScrollbarWrapper } from '@chili-publish/grafx-shared-components';
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
    const { featureFlags } = useFeatureFlagContext();

    return (
        <LeftPanelContainer
            id="left-panel"
            data-intercom-target="Customize panel"
            overflowScroll={contentType !== ContentType.IMAGE_PANEL}
        >
            <ScrollbarWrapper>
                <VariablesListContainer hidden={contentType === ContentType.IMAGE_PANEL}>
                    {featureFlags?.studioDataSource ? <DataSource /> : null}
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

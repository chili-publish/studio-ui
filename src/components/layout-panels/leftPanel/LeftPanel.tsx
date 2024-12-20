import { Variable } from '@chili-publish/studio-sdk';
import { ImagePanelContainer, LeftPanelContainer, VariablesListContainer } from './LeftPanel.styles';
import ImagePanel from '../../imagePanel/ImagePanel';
import VariablesList from '../../variables/VariablesList';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { ContentType } from '../../../contexts/VariablePanelContext.types';
import DataSource from '../../dataSource/DataSource';
import { useFeatureFlagContext } from '../../../contexts/FeatureFlagProvider';

interface LeftPanelProps {
    variables: Variable[];
    isDocumentLoaded: boolean;
}

function LeftPanel({ variables, isDocumentLoaded }: LeftPanelProps) {
    const { contentType } = useVariablePanelContext();
    const { featureFlags } = useFeatureFlagContext();

    return (
        <LeftPanelContainer
            id="left-panel"
            data-intercom-target="Customize panel"
            overflowScroll={contentType !== ContentType.IMAGE_PANEL}
        >
            <VariablesListContainer hidden={contentType === ContentType.IMAGE_PANEL}>
                {featureFlags?.STUDIO_DATA_SOURCE ? <DataSource isDocumentLoaded={isDocumentLoaded} /> : null}
                <VariablesList variables={variables} isDocumentLoaded={isDocumentLoaded} />
            </VariablesListContainer>

            <ImagePanelContainer hidden={contentType !== ContentType.IMAGE_PANEL}>
                <ImagePanel />
            </ImagePanelContainer>
        </LeftPanelContainer>
    );
}

export default LeftPanel;

import { Variable } from '@chili-publish/studio-sdk';
import { useTheme } from '@chili-publish/grafx-shared-components';
import { ImagePanelContainer, LeftPanelContainer, VariablesListContainer } from './LeftPanel.styles';
import ImagePanel from '../../imagePanel/ImagePanel';
import VariablesList from '../../variables/VariablesList';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { ContentType } from '../../../contexts/VariablePanelContext.types';
import DataSource from '../../dataSource/DataSource';

interface LeftPanelProps {
    variables: Variable[];
    isSandboxMode: boolean;
    isDocumentLoaded: boolean;
}

function LeftPanel({ variables, isSandboxMode, isDocumentLoaded }: LeftPanelProps) {
    const { contentType } = useVariablePanelContext();
    const { panel } = useTheme();

    return (
        <LeftPanelContainer
            id="left-panel"
            data-intercom-target="Customize panel"
            overflowScroll={contentType !== ContentType.IMAGE_PANEL}
            panelTheme={panel}
        >
            <VariablesListContainer hidden={contentType === ContentType.IMAGE_PANEL}>
                {isDocumentLoaded && isSandboxMode ? <DataSource /> : null}
                <VariablesList variables={variables} isDocumentLoaded={isDocumentLoaded} />
            </VariablesListContainer>

            <ImagePanelContainer hidden={contentType !== ContentType.IMAGE_PANEL}>
                <ImagePanel />
            </ImagePanelContainer>
        </LeftPanelContainer>
    );
}

export default LeftPanel;

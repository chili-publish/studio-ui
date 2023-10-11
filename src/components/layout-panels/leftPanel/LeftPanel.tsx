import { Variable } from '@chili-publish/studio-sdk';
import { ImagePanelContainer, LeftPanelContainer, VariablesListContainer } from './LeftPanel.styles';
import ImagePanel from '../../imagePanel/ImagePanel';
import VariablesList from '../../variables/VariablesList';
import { useVariablePanelContext } from '../../../contexts/VariablePanelContext';
import { ContentType } from '../../../contexts/VariablePanelContext.types';

interface LeftPanelProps {
    variables: Variable[];
    isDocumentLoaded: boolean;
}

function LeftPanel({ variables, isDocumentLoaded }: LeftPanelProps) {
    const { contentType } = useVariablePanelContext();

    return (
        <LeftPanelContainer id="left-panel">
            <VariablesListContainer hidden={contentType === ContentType.IMAGE_PANEL}>
                <VariablesList variables={variables} isDocumentLoaded={isDocumentLoaded} />
            </VariablesListContainer>
            <ImagePanelContainer hidden={contentType !== ContentType.IMAGE_PANEL}>
                <ImagePanel />
            </ImagePanelContainer>
        </LeftPanelContainer>
    );
}

export default LeftPanel;

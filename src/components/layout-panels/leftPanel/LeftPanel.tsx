import { Variable } from '@chili-publish/studio-sdk';
import { LeftPanelContainer, VariablesListContainer } from './LeftPanel.styles';
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
            {contentType === ContentType.VARIABLES_LIST ? (
                <VariablesListContainer>
                    <VariablesList variables={variables} isDocumentLoaded={isDocumentLoaded} />
                </VariablesListContainer>
            ) : (
                <div style={{ padding: '0 0 0 1.25rem' }}>
                    <ImagePanel />
                </div>
            )}
        </LeftPanelContainer>
    );
}

export default LeftPanel;

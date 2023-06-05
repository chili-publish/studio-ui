import { Variable } from '@chili-publish/studio-sdk';
import { LeftPanelContainer, VariablesListContainer } from './LeftPanel.styles';
import ImagePanel from '../../imagePanel/ImagePanel';
import VariablesList from '../../variables/VariablesList';
import { useTrayAndLeftPanelContext } from '../../../contexts/TrayAndLeftPanelContext';
import { ContentType } from '../../../contexts/TrayAndLeftPanelContext.types';

interface LeftPanelProps {
    variables: Variable[];
}

function LeftPanel({ variables }: LeftPanelProps) {
    const { contentType } = useTrayAndLeftPanelContext();

    return (
        <LeftPanelContainer id="left-panel">
            {contentType === ContentType.VARIABLES_LIST ? (
                <VariablesListContainer>
                    <VariablesList variables={variables} />
                </VariablesListContainer>
            ) : (
                <ImagePanel />
            )}
        </LeftPanelContainer>
    );
}

export default LeftPanel;

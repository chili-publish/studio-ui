import { Variable } from '@chili-publish/studio-sdk';
import { LeftPanelContainer } from './LeftPanel.styles';
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
        <LeftPanelContainer>
            {contentType === ContentType.VARIABLES_LIST ? (
                <div style={{ padding: '0 1.25rem' }}>
                    <VariablesList variables={variables} />
                </div>
            ) : (
                <ImagePanel />
            )}
            {/* <div style={{ padding: '0 1.25rem' }}>
                <VariablesList variables={variables} />
            </div> */}
        </LeftPanelContainer>
    );
}

export default LeftPanel;

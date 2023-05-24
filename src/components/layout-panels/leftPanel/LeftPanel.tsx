import React, { useState } from 'react';
import { ImagePicker } from '@chili-publish/grafx-shared-components/lib';
import { LeftPanelContainer } from './LeftPanel.styles';
import { LeftPanelContentType } from './LeftPanel.types';
import ImagePanel from '../../imagePanel/ImagePanel';

function LeftPanel() {
    const [leftPanelContentType, setLeftPanelContentType] = useState(LeftPanelContentType.VARIABLES_PANEL);

    const showVariablesPanel = () => {
        setLeftPanelContentType(LeftPanelContentType.VARIABLES_PANEL);
    };

    return (
        <LeftPanelContainer>
            {leftPanelContentType === LeftPanelContentType.VARIABLES_PANEL ? (
                <div style={{ padding: '0 1.25rem' }}>
                    <ImagePicker
                        label={<div>Background Image</div>}
                        name="background"
                        onClick={() => {
                            setLeftPanelContentType(LeftPanelContentType.IMAGE_PANEL);
                        }}
                    />
                </div>
            ) : (
                <ImagePanel showVariablesPanel={showVariablesPanel} />
            )}
        </LeftPanelContainer>
    );
}

export default LeftPanel;

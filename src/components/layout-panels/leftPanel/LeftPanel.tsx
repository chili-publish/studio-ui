import React from 'react';
import { LeftPanelContainer } from './LeftPanel.styles';

interface LeftPanelProps {
    children: React.ReactNode;
}

function LeftPanel({ children }: LeftPanelProps) {
    return <LeftPanelContainer>{children}</LeftPanelContainer>;
}

export default LeftPanel;

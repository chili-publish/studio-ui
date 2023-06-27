import React from 'react';
import { AvailableIcons, Icon } from '@chili-publish/grafx-shared-components';
import { DropdownOptionLabel, DropdownOptionText, ExperimentalPill } from './DownloadPanel.styles';

interface DropdownOptionProps {
    icon: keyof typeof AvailableIcons;
    text: string;
    isExperimental?: boolean;
}

function DropdownOption(props: DropdownOptionProps) {
    const { icon, text, isExperimental } = props;

    return (
        <DropdownOptionLabel>
            <Icon icon={icon} />
            <DropdownOptionText>{text}</DropdownOptionText>
            {isExperimental && <ExperimentalPill>Experimental</ExperimentalPill>}
        </DropdownOptionLabel>
    );
}

export default DropdownOption;

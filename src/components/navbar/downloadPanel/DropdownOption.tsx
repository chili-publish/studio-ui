import React from 'react';
import { AvailableIcons, Icon } from '@chili-publish/grafx-shared-components';
import { DropdownOptionLabel, DropdownOptionText } from './DownloadPanel.styles';

interface DropdownOptionProps {
    icon: keyof typeof AvailableIcons;
    text: string;
}

function DropdownOption(props: DropdownOptionProps) {
    const { icon, text } = props;

    return (
        <DropdownOptionLabel>
            <Icon icon={icon} />
            <DropdownOptionText>{text}</DropdownOptionText>
        </DropdownOptionLabel>
    );
}

export default DropdownOption;

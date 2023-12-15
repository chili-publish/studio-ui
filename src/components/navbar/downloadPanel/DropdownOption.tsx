import React from 'react';
import { AvailableIcons, Icon } from '@chili-publish/grafx-shared-components';
import {
    DropdownOptionLabel,
    DropdownOptionText,
    ExperimentalPill,
    Container,
    DropdownOptionDescription,
} from './DownloadPanel.styles';

interface DropdownOptionProps {
    icon: keyof typeof AvailableIcons;
    text: string;
    description: string;
    isExperimental?: boolean;
}

function DropdownOption(props: DropdownOptionProps) {
    const { icon, text, description, isExperimental } = props;

    return (
        <DropdownOptionLabel>
            <Icon icon={icon} />
            <Container>
                <DropdownOptionText>{text}</DropdownOptionText>
                <DropdownOptionDescription>{description}</DropdownOptionDescription>
            </Container>
            {isExperimental && <ExperimentalPill>Experimental</ExperimentalPill>}
        </DropdownOptionLabel>
    );
}

export default DropdownOption;

import { AvailableIcons, Icon, useTheme } from '@chili-publish/grafx-shared-components';
import {
    DropdownOptionLabel,
    DropdownOptionText,
    ExperimentalPill,
    Container,
    DropdownOptionDescription,
} from './DownloadPanel.styles';

interface DropdownOptionProps {
    iconData: keyof typeof AvailableIcons;
    text: string;
    description: string;
    isExperimental?: boolean;
}

function DropdownOption(props: DropdownOptionProps) {
    const { iconData, text, description, isExperimental } = props;
    const { dropdown, themeColors } = useTheme();
    return (
        <DropdownOptionLabel themeColors={themeColors}>
            <Icon icon={iconData} />
            <Container dropdownStyles={dropdown}>
                <DropdownOptionText>{text}</DropdownOptionText>
                <DropdownOptionDescription>{description}</DropdownOptionDescription>
            </Container>
            {isExperimental && <ExperimentalPill>Experimental</ExperimentalPill>}
        </DropdownOptionLabel>
    );
}

export default DropdownOption;

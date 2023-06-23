import { AvailableIcons, DropDown, Icon, Option } from '@chili-publish/grafx-shared-components';
import { useCallback, useState } from 'react';
import useMobileSize from '../../hooks/useMobileSize';
import {
    Label,
    MobileDropdownOptionContainer,
    MobileDropdownMenuOption,
    DropdownContainer,
    MobileDropdownOptionContent,
    MobileDropdownValue,
} from './StudioDropdown.styles';

interface StudioDropdownProps {
    label?: string;
    selectedValue?: Option;
    options: Option[];
    width?: string;
    onChange?: (_: string) => void;
    onMenuOpen?: () => void;
    onMenuClose?: () => void;
}
function StudioDropdown({
    label,
    selectedValue,
    options,
    width,
    onChange,
    onMenuOpen,
    onMenuClose,
}: StudioDropdownProps) {
    const isMobileSize = useMobileSize();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const openMobileDropdown = useCallback(() => {
        setIsDropdownOpen(true);
        if (onMenuOpen) onMenuOpen();
    }, [onMenuOpen]);

    const closeMobileDropdown = useCallback(() => {
        setIsDropdownOpen(false);
        if (onMenuClose) onMenuClose();
    }, [onMenuClose]);

    if (!isMobileSize) {
        return (
            <>
                {label && <Label marginBottom="0.75rem">{label}</Label>}
                <DropDown
                    value={selectedValue}
                    options={options}
                    onChange={(val) => onChange?.(val?.value?.toString() || '')}
                    width={width || '100%'}
                    isSearchable={false}
                />
            </>
        );
    }

    if (isMobileSize) {
        return isDropdownOpen ? (
            <>
                {options.map((option) => (
                    <MobileDropdownMenuOption
                        key={option.value}
                        selected={selectedValue?.value === option.value}
                        onClick={() => {
                            onChange?.(option.value as string);
                            closeMobileDropdown();
                        }}
                    >
                        <MobileDropdownOptionContent>
                            {option.label}
                            {selectedValue?.value === option.value && <Icon icon={AvailableIcons.faCheck} />}
                        </MobileDropdownOptionContent>
                    </MobileDropdownMenuOption>
                ))}
            </>
        ) : (
            <DropdownContainer onClick={() => openMobileDropdown()}>
                {label && <Label>{label}</Label>}
                <MobileDropdownOptionContainer>
                    <MobileDropdownValue>{selectedValue?.label}</MobileDropdownValue>
                    <Icon icon={AvailableIcons.faChevronDown} />
                </MobileDropdownOptionContainer>
            </DropdownContainer>
        );
    }
    return null;
}

export default StudioDropdown;
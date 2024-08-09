import { AvailableIcons, DropDown, Icon, Option, useMobileSize } from '@chili-publish/grafx-shared-components';
import { useCallback, useState } from 'react';
import {
    Label,
    MobileDropdownOptionContainer,
    MobileDropdownMenuOption,
    DropdownContainer,
    MobileDropdownOptionContent,
    MobileDropdownValue,
    MobilePlaceholderWrapper,
} from './StudioDropdown.styles';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';

interface StudioDropdownProps {
    dataId: string;
    label?: string;
    selectedValue?: Option;
    options: Option[];
    width?: string;
    placeholder?: string;
    onChange?: (_: string) => void;
    onMenuOpen?: () => void;
    onMenuClose?: () => void;
}
function StudioDropdown({
    dataId,
    label,
    selectedValue,
    options,
    width,
    placeholder,
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
                    dataId={getDataIdForSUI(`dropdown-${dataId}`)}
                    dataTestId={getDataTestIdForSUI(`dropdown-${dataId}`)}
                    value={selectedValue}
                    options={options}
                    onChange={(val) => onChange?.(val?.value?.toString() || '')}
                    width={width || '100%'}
                    isSearchable={false}
                    placeholder={placeholder}
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
                    <MobileDropdownValue>
                        {selectedValue?.label ? (
                            // eslint-disable-next-line react/jsx-no-useless-fragment
                            <>{selectedValue.label}</>
                        ) : (
                            <MobilePlaceholderWrapper>{placeholder}</MobilePlaceholderWrapper>
                        )}
                    </MobileDropdownValue>
                    <Icon icon={AvailableIcons.faChevronDown} />
                </MobileDropdownOptionContainer>
            </DropdownContainer>
        );
    }
    return null;
}

export default StudioDropdown;

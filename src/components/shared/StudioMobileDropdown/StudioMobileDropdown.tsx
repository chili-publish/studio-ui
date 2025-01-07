import { AvailableIcons, Icon, InputLabel, SelectOptions } from '@chili-publish/grafx-shared-components';
import { useCallback, useState } from 'react';
import {
    DropdownContainer,
    MobileDropdownMenuOption,
    MobileDropdownOptionContainer,
    MobileDropdownOptionContent,
    MobileDropdownValue,
    MobilePlaceholderWrapper,
} from './StudioMobileDropdown.styles';
import { ErrorMessage } from '../ErrorMessage.styles';

interface StudioMobileDropdownProps {
    selectedValue?: SelectOptions;
    options: SelectOptions[];
    dataId: string;
    isOpen?: boolean;
    label?: string;
    placeholder?: string;
    validationError?: string;
    required?: boolean;
    onChange: (_: string) => void;
    onMenuOpen?: () => void;
    onMenuClose?: () => void;
}
function StudioMobileDropdown({
    dataId,
    isOpen,
    label,
    selectedValue,
    options,
    placeholder,
    validationError,
    required,
    onChange,
    onMenuOpen,
    onMenuClose,
}: StudioMobileDropdownProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(isOpen);

    const openMobileDropdown = useCallback(() => {
        setIsDropdownOpen(true);
        if (onMenuOpen) onMenuOpen();
    }, [onMenuOpen]);

    const closeMobileDropdown = useCallback(() => {
        setIsDropdownOpen(false);
        if (onMenuClose) onMenuClose();
    }, [onMenuClose]);

    return isDropdownOpen ? (
        <>
            {options.map((option) => (
                <MobileDropdownMenuOption
                    key={option.value}
                    selected={selectedValue?.value === option.value}
                    onClick={() => {
                        onChange(option.value as string);
                        closeMobileDropdown();
                    }}
                >
                    <MobileDropdownOptionContent>
                        {option.label as string}
                        {selectedValue?.value === option.value && <Icon icon={AvailableIcons.faCheck} />}
                    </MobileDropdownOptionContent>
                </MobileDropdownMenuOption>
            ))}
        </>
    ) : (
        <DropdownContainer data-id={dataId} onClick={() => openMobileDropdown()}>
            {label ? <InputLabel labelFor={label} label={label} required={required} /> : null}
            <MobileDropdownOptionContainer hasError={!!validationError}>
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
            {validationError ? <ErrorMessage>{validationError}</ErrorMessage> : null}
        </DropdownContainer>
    );
}

export default StudioMobileDropdown;

import { SelectOptions } from '@chili-publish/grafx-shared-components';
import { useCallback, useState } from 'react';
import StudioMobileDropdownOptions from './StudioMobileDropdownOptions';
import StudioMobileDropdownControl from './StudioMobileDropdownControl';

interface StudioMobileDropdownProps {
    selectedValue?: SelectOptions | null;
    options: SelectOptions[];
    dataId: string;
    isOpen?: boolean;
    label?: string;
    placeholder?: string;
    validationError?: string;
    required?: boolean;
    onChange?: (_: string) => void;
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
        <StudioMobileDropdownOptions
            options={options}
            selectedValue={selectedValue}
            onChange={onChange}
            onClose={closeMobileDropdown}
        />
    ) : (
        <StudioMobileDropdownControl
            dataId={dataId}
            label={label}
            selectedValue={selectedValue}
            placeholder={placeholder}
            validationError={validationError}
            required={required}
            onOpen={openMobileDropdown}
        />
    );
}

export default StudioMobileDropdown;

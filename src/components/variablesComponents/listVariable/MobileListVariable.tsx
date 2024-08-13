import { AvailableIcons, Icon, InputLabel, Option } from '@chili-publish/grafx-shared-components';
import { useCallback, useState } from 'react';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';
import {
    DropdownContainer,
    MobileDropdownMenuOption,
    MobileDropdownOptionContainer,
    MobileDropdownOptionContent,
    MobileDropdownValue,
    MobilePlaceholderWrapper,
} from './MobileListVariable.styles';
import { ErrorMessage } from '../../shared/ErrorMessage.styles';
import { getVariablePlaceholder } from '../variablePlaceholder.util';

interface MobileListVariableProps {
    variable: ListVariable;
    validationError?: string;
    required?: boolean;
    isOpen?: boolean;
    onItemSelected: (_: ListVariable) => void;
    onMenuOpen?: () => void;
    onMenuClose?: () => void;
}

function MobileListVariable({
    variable,
    required,
    validationError,
    isOpen,
    onMenuOpen,
    onMenuClose,
    onItemSelected,
}: MobileListVariableProps) {
    const options = variable.items.map((item) => ({
        label: item.displayValue || item.value,
        value: item.value,
    }));
    const selectedValue = variable.selected
        ? {
              label: variable.selected.displayValue || variable.selected.value,
              value: variable.selected.value,
          }
        : ('' as unknown as Option);
    const placeholder = getVariablePlaceholder(variable);

    const [isDropdownOpen, setIsDropdownOpen] = useState(isOpen);

    const openMobileDropdown = useCallback(() => {
        setIsDropdownOpen(true);
        if (onMenuOpen) onMenuOpen();
    }, [onMenuOpen]);

    const closeMobileDropdown = useCallback(() => {
        setIsDropdownOpen(false);
        if (onMenuClose) onMenuClose();
    }, [onMenuClose]);

    const updateVariableValue = async (value: string) => {
        onItemSelected({ ...variable, selected: { value } });
        await window.SDK.variable.setValue(variable.id, value);
    };

    return isDropdownOpen ? (
        <>
            {options.map((option) => (
                <MobileDropdownMenuOption
                    key={option.value}
                    selected={selectedValue?.value === option.value}
                    onClick={() => {
                        updateVariableValue(option.value as string);
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
            {variable.name ? <InputLabel labelFor={variable.name} label={variable.name} required={required} /> : null}
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

export default MobileListVariable;

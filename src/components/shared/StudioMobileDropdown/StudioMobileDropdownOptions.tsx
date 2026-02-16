import { AvailableIcons, Icon, SelectOptions } from '@chili-publish/grafx-shared-components';
import { MobileDropdownMenuOption, MobileDropdownOptionContent } from './StudioMobileDropdown.styles';

interface StudioMobileDropdownOptionsProps {
    options: SelectOptions[];
    selectedValue: SelectOptions | null | undefined;
    onChange?: (value: string) => void;
    onClose: () => void;
}
const StudioMobileDropdownOptions = ({
    options,
    selectedValue,
    onChange,
    onClose,
}: StudioMobileDropdownOptionsProps) => {
    return (
        <>
            {options.map((option) => (
                <MobileDropdownMenuOption
                    key={option.value}
                    selected={selectedValue?.value === option.value}
                    onClick={() => {
                        onChange?.(option.value as string);
                        onClose();
                    }}
                >
                    <MobileDropdownOptionContent>
                        {option.label as string}
                        {selectedValue?.value === option.value && <Icon icon={AvailableIcons.faCheck} />}
                    </MobileDropdownOptionContent>
                </MobileDropdownMenuOption>
            ))}
        </>
    );
};

export default StudioMobileDropdownOptions;

import { DropDown, Option } from '@chili-publish/grafx-shared-components';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';

interface StudioDropdownProps {
    dataId: string;
    label?: string;
    selectedValue?: Option;
    options: Option[];
    width?: string;
    placeholder?: string;
    validationError?: string;
    required?: boolean;
    onChange?: (_: string) => void;
}
function StudioDropdown({
    dataId,
    label,
    selectedValue,
    options,
    width,
    placeholder,
    validationError,
    required,
    onChange,
}: StudioDropdownProps) {
    return (
        <DropDown
            dataId={getDataIdForSUI(`dropdown-${dataId}`)}
            dataTestId={getDataTestIdForSUI(`dropdown-${dataId}`)}
            value={selectedValue}
            options={options}
            onChange={(val) => onChange?.(val?.value?.toString() || '')}
            width={width || '100%'}
            isSearchable={false}
            placeholder={placeholder}
            required={required}
            label={label}
            validationErrorMessage={validationError}
        />
    );
}

export default StudioDropdown;

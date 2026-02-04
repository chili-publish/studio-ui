import { Select, SelectOptions } from '@chili-publish/grafx-shared-components';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';

interface StudioDropdownProps {
    dataId: string;
    id?: string;
    label?: string;
    selectedValue?: SelectOptions;
    options: SelectOptions[];
    width?: string;
    placeholder?: string;
    validationError?: string;
    required?: boolean;
    onChange?: (_: string) => void;
    onMenuOpen?: () => void;
    onMenuClose?: () => void;
}
const StudioDropdown = ({
    dataId,
    label,
    selectedValue,
    options,
    width,
    placeholder,
    validationError,
    required,
    onChange,
    onMenuOpen,
    onMenuClose,
    id,
}: StudioDropdownProps) => {
    return (
        <Select
            id={id}
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
            onMenuOpen={onMenuOpen}
            onMenuClose={onMenuClose}
        />
    );
};

export default StudioDropdown;

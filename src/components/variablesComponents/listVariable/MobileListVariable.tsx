import { SelectOptions } from '@chili-publish/grafx-shared-components';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';

import { getVariablePlaceholder } from '../variablePlaceholder.util';
import StudioMobileDropdown from '../../shared/StudioMobileDropdown/StudioMobileDropdown';
import { getDataIdForSUI } from '../../../utils/dataIds';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';

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
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();

    const options = variable.items.map((item) => ({
        label: item.displayValue || item.value,
        value: item.value,
    }));
    const selectedValue = variable.selected
        ? {
              label: variable.selected.displayValue || variable.selected.value,
              value: variable.selected.value,
          }
        : ('' as unknown as SelectOptions);
    const placeholder = getVariablePlaceholder(variable);

    const updateVariableValue = async (value: string) => {
        onItemSelected({ ...variable, selected: { value } });
        await window.StudioUISDK.variable.setValue(variable.id, value);
    };

    return (
        <StudioMobileDropdown
            dataId={getDataIdForSUI(`variable-list-${variable.id}`)}
            isOpen={isOpen}
            label={variable.label ?? variable.name}
            selectedValue={selectedValue}
            options={options}
            placeholder={placeholder}
            required={required}
            validationError={validationError}
            onChange={updateVariableValue}
            onMenuOpen={() => {
                if (onMenuOpen) onMenuOpen();
                onVariableFocus?.(variable.id);
            }}
            onMenuClose={() => {
                if (onMenuClose) onMenuClose();
                onVariableBlur?.(variable.id);
            }}
        />
    );
}

export default MobileListVariable;

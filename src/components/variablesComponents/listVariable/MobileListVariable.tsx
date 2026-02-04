import { SelectOptions } from '@chili-publish/grafx-shared-components';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';

import { getVariablePlaceholder } from '../variablePlaceholder.util';
import { getDataIdForSUI } from '../../../utils/dataIds';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import StudioMobileDropdownControl from '../../shared/StudioMobileDropdown/StudioMobileDropdownControl';

interface MobileListVariableProps {
    variable: ListVariable;
    required?: boolean;
    validationError?: string;
    onMenuOpen?: () => void;
}

const MobileListVariable = ({ variable, required, validationError, onMenuOpen }: MobileListVariableProps) => {
    const { onVariableFocus } = useUiConfigContext();

    const selectedValue = variable.selected
        ? {
              label: variable.selected.displayValue || variable.selected.value,
              value: variable.selected.value,
          }
        : ('' as unknown as SelectOptions);
    const placeholder = getVariablePlaceholder(variable);

    return (
        <StudioMobileDropdownControl
            dataId={getDataIdForSUI(`variable-list-${variable.id}`)}
            label={variable.label ?? variable.name}
            selectedValue={selectedValue}
            placeholder={placeholder}
            required={required}
            validationError={validationError}
            onOpen={() => {
                if (onMenuOpen) onMenuOpen();
                onVariableFocus?.(variable.id);
            }}
        />
    );
};

export default MobileListVariable;

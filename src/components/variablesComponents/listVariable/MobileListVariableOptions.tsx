import { useSelector } from 'react-redux';
import { ListVariable } from '@chili-publish/studio-sdk/lib/src/next';
import { SelectOptions } from '@chili-publish/grafx-shared-components';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import { selectCurrentVariable, validateVariable } from '../../../store/reducers/variableReducer';
import StudioMobileDropdownOptions from '../../shared/StudioMobileDropdown/StudioMobileDropdownOptions';
import { showVariablesPanel } from '../../../store/reducers/panelReducer';
import { useAppDispatch } from '../../../store';

function MobileListVariableOptions() {
    const variable = useSelector(selectCurrentVariable) as ListVariable;
    const dispatch = useAppDispatch();
    const { onVariableBlur, projectConfig } = useUiConfigContext();

    const selectedValue = variable.selected
        ? {
              label: variable.selected.displayValue || variable.selected.value,
              value: variable.selected.value,
          }
        : ('' as unknown as SelectOptions);

    const options = variable?.items.map((item) => ({
        label: item.displayValue || item.value,
        value: item.value,
    }));

    const updateVariableValue = async (value: string) => {
        if (!variable) return;
        dispatch(validateVariable({ ...variable, selected: { value } } as ListVariable));
        const result = await window.StudioUISDK.variable.setValue(variable.id, value);
        if (result.success) {
            projectConfig.onVariableValueChangedCompleted?.(variable.id, value);
        }
    };

    const handleClose = () => {
        if (!variable) return;
        onVariableBlur?.(variable.id);
        dispatch(showVariablesPanel());
    };

    return (
        <StudioMobileDropdownOptions
            options={options}
            selectedValue={selectedValue}
            onChange={updateVariableValue}
            onClose={handleClose}
        />
    );
}

export default MobileListVariableOptions;

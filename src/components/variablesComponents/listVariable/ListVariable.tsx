import { InputLabel, SelectOptions } from '@chili-publish/grafx-shared-components';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import { useFeatureFlagContext } from '../../../contexts/FeatureFlagProvider';
import StudioDropdown from '../../shared/StudioDropdown';
import { ComponentWrapper } from '../../variables/VariablesPanel.styles';
import { getVariablePlaceholder } from '../variablePlaceholder.util';
import { HelpTextWrapper } from '../VariablesComponents.styles';
import { IListVariable } from '../VariablesComponents.types';

function ListVariable(props: IListVariable) {
    const { variable, validationError, onChange } = props;
    const { featureFlags } = useFeatureFlagContext();
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

    const updateVariableValue = async (variableId: string, value: string) => {
        await window.StudioUISDK.variable.setValue(variableId, value);
        onChange({ ...variable, selected: { value } });
    };

    return (
        <ComponentWrapper
            key={`variable-component-${variable.id}`}
            data-intercom-target={`dropdown-variable-${variable.name}`}
        >
            <HelpTextWrapper>
                <div>
                    <StudioDropdown
                        dataId={variable.id}
                        label={
                            featureFlags?.STUDIO_LABEL_PROPERTY_ENABLED
                                ? variable.label ?? variable.name
                                : variable.name
                        }
                        selectedValue={selectedValue || ''}
                        options={options}
                        placeholder={placeholder}
                        required={variable.isRequired}
                        validationError={validationError}
                        onChange={(val) => updateVariableValue(variable.id, val)}
                        onMenuOpen={() => onVariableFocus?.(variable.id)}
                        onMenuClose={() => onVariableBlur?.(variable.id)}
                    />
                </div>
                {variable.helpText && !validationError ? (
                    <InputLabel labelFor={variable.id} label={variable.helpText} />
                ) : null}
            </HelpTextWrapper>
        </ComponentWrapper>
    );
}

export default ListVariable;

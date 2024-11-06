import { Option, InputLabel } from '@chili-publish/grafx-shared-components';
import { ComponentWrapper } from '../../variables/VariablesPanel.styles';
import { getVariablePlaceholder } from '../variablePlaceholder.util';
import { IListVariable } from '../VariablesComponents.types';
import { HelpTextWrapper } from '../VariablesComponents.styles';
import StudioDropdown from '../../shared/StudioDropdown';

function ListVariable(props: IListVariable) {
    const { variable, validationError, onChange } = props;

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
                        label={variable.name}
                        // TODO: uncomment when Label FF is removed from WRS
                        // label={variable.label ?? variable.name}
                        selectedValue={selectedValue || ''}
                        options={options}
                        placeholder={placeholder}
                        required={variable.isRequired}
                        validationError={validationError}
                        onChange={(val) => updateVariableValue(variable.id, val)}
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

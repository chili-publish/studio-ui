import { Input, InputLabel, Label, ValidationTypes } from '@chili-publish/grafx-shared-components';
import { ChangeEvent } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { HelpTextWrapper } from './VariablesComponents.styles';
import { INumberVariable } from './VariablesComponents.types';
import { useUiConfigContext } from '../../contexts/UiConfigContext';

function NumberVariable(props: INumberVariable) {
    const { variable, validationError, onValueChange } = props;
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();

    return (
        <HelpTextWrapper>
            <Input
                type="number"
                name={variable.id}
                min={variable.minValue}
                max={variable.maxValue}
                precision={variable.numberOfDecimals}
                label={
                    <Label translationKey={variable.label ?? variable.name} value={variable.label ?? variable.name} />
                }
                value={`${variable.value}`}
                step={variable.showStepper ? variable.stepSize : undefined}
                dataId={getDataIdForSUI(`input-number-${variable.id}`)}
                dataTestId={getDataTestIdForSUI(`input-number-${variable.id}`)}
                dataIntercomId={`input-variable-${variable.name}`}
                onFocus={() => {
                    onVariableFocus?.(variable.id);
                }}
                onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                    const currentValue = parseFloat(event.target.value.replace(',', '.'));
                    const prevValue = variable.value;
                    onValueChange(currentValue, { changed: prevValue !== currentValue });
                    onVariableBlur?.(variable.id);
                }}
                onValueChange={(value: string) => {
                    const currentValue = parseFloat(value.replace(',', '.'));
                    const prevValue = variable.value;
                    const hasChanged = prevValue !== currentValue;

                    // if value changed via stepper, ensure focus/blur handlers are called
                    if (hasChanged) {
                        onVariableFocus?.(variable.id);
                        onValueChange(currentValue, { changed: true });
                        onVariableBlur?.(variable.id);
                    } else {
                        onValueChange(currentValue, { changed: false });
                    }
                }}
                disabled={variable.isReadonly}
                required={variable.isRequired}
                validation={validationError ? ValidationTypes.ERROR : undefined}
                validationErrorMessage={validationError}
            />
            {variable.helpText && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
}
export default NumberVariable;

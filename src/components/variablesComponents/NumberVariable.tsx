import { Input, InputLabel, Label, ValidationTypes } from '@chili-publish/grafx-shared-components';
import { ChangeEvent } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { HelpTextWrapper } from './VariablesComponents.styles';
import { INumberVariable } from './VariablesComponents.types';
import { useUiConfigContext } from '../../contexts/UiConfigContext';
import { useValueDraft } from './useValueDraft';

const NumberVariable = (props: INumberVariable) => {
    const { variable, validationError, onValidateValue, onCommitValue } = props;
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();

    const [draft, setDraft, revertToCommitted] = useValueDraft(variable.id, `${variable.value}`);

    const commitIfChanged = async (raw: string) => {
        const num = Number(raw.replace(',', '.'));
        if (Number.isNaN(num)) return;
        if (num === variable.value) return;
        onValidateValue(num);
        try {
            const result = await onCommitValue(num);
            if (result && !result.success) {
                revertToCommitted();
                onValidateValue(variable.value);
            }
        } catch {
            revertToCommitted();
            onValidateValue(variable.value);
        }
    };

    const handleBlur = (event: ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        setDraft(raw);
        const num = parseFloat(raw.replace(',', '.'));
        const prevValue = variable.value;
        const changed = prevValue !== num;
        if (Number.isNaN(num)) {
            onValidateValue(num);
        } else if (changed) {
            commitIfChanged(raw);
        } else {
            onValidateValue(num);
        }
        onVariableBlur?.(variable.id);
    };

    const handleChange = (value: string) => {
        setDraft(value);
        const num = parseFloat(value.replace(',', '.'));
        const prevValue = variable.value;
        const hasChanged = prevValue !== num;
        if (hasChanged) {
            onVariableFocus?.(variable.id);
            if (Number.isNaN(num)) {
                onValidateValue(num);
            } else {
                commitIfChanged(value);
            }
            onVariableBlur?.(variable.id);
        } else {
            onValidateValue(num);
        }
    };

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
                value={draft}
                step={variable.showStepper ? variable.stepSize : undefined}
                dataId={getDataIdForSUI(`input-number-${variable.id}`)}
                dataTestId={getDataTestIdForSUI(`input-number-${variable.id}`)}
                dataIntercomId={`input-variable-${variable.name}`}
                onFocus={() => {
                    onVariableFocus?.(variable.id);
                }}
                onBlur={handleBlur}
                onValueChange={handleChange}
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
};
export default NumberVariable;

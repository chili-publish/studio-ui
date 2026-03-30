import { Input, InputLabel, Label, ValidationTypes } from '@chili-publish/grafx-shared-components';
import { ChangeEvent } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import { HelpTextWrapper } from '../VariablesComponents.styles';
import { INumberVariable } from '../VariablesComponents.types';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import { useNumberVariableDraft } from './useNumberVariableDraft';

const NumberVariable = (props: INumberVariable) => {
    const { variable, validationError, onValidateValue, onCommitValue } = props;
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();

    const { draft, commitIfChanged, updateDraftWithoutCommit } = useNumberVariableDraft(
        variable,
        onValidateValue,
        onCommitValue,
    );

    const handleBlur = (event: ChangeEvent<HTMLInputElement>) => {
        commitIfChanged(event.target.value);
        onVariableBlur?.(variable.id);
    };

    const handleChange = (value: string) => {
        const num = Number(value.replace(',', '.'));
        const prevValue = variable.value;
        const hasChanged = prevValue !== num;
        if (hasChanged) {
            onVariableFocus?.(variable.id);
            commitIfChanged(value);
            onVariableBlur?.(variable.id);
        } else {
            updateDraftWithoutCommit(value, num);
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

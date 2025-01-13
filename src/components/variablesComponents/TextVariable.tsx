import { Input, InputLabel, Label, ValidationTypes } from '@chili-publish/grafx-shared-components';
import { LongTextVariable, ShortTextVariable } from '@chili-publish/studio-sdk';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useFeatureFlagContext } from '../../contexts/FeatureFlagProvider';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { HelpTextWrapper } from './VariablesComponents.styles';
import { ITextVariable } from './VariablesComponents.types';
import { getVariablePlaceholder } from './variablePlaceholder.util';
import { useUiConfigContext } from '../../contexts/UiConfigContext';

function TextVariable(props: ITextVariable) {
    const { variable, validationError, onValueChange } = props;
    const { featureFlags } = useFeatureFlagContext();
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();

    const [variableValue, setVariableValue] = useState(
        (variable as ShortTextVariable).value || (variable as LongTextVariable).value,
    );
    const placeholder = getVariablePlaceholder(variable);

    useEffect(() => {
        setVariableValue((variable as ShortTextVariable).value || (variable as LongTextVariable).value);
    }, [variable]);

    const handleVariableChange = async (e: ChangeEvent<HTMLInputElement>) => {
        setVariableValue(e.target.value);
    };

    return (
        <HelpTextWrapper>
            <Input
                type="text"
                dataId={getDataIdForSUI(`input-${variable.id}`)}
                dataTestId={getDataTestIdForSUI(`input-${variable.id}`)}
                dataIntercomId={`input-variable-${variable.name}`}
                value={variableValue}
                placeholder={placeholder}
                required={variable.isRequired}
                onChange={handleVariableChange}
                onFocus={() => onVariableFocus?.(variable.id)}
                onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                    const oldValue = (variable as ShortTextVariable).value || (variable as LongTextVariable).value;
                    const newValue = event.target.value;
                    onValueChange(newValue, { changed: oldValue !== newValue });
                    onVariableBlur?.(variable.id);
                }}
                name={variable.id}
                label={
                    <Label
                        translationKey={
                            featureFlags?.STUDIO_LABEL_PROPERTY_ENABLED
                                ? variable.label ?? variable.name
                                : variable.name
                        }
                        value={
                            featureFlags?.STUDIO_LABEL_PROPERTY_ENABLED
                                ? variable.label ?? variable.name
                                : variable.name
                        }
                    />
                }
                validation={validationError ? ValidationTypes.ERROR : undefined}
                validationErrorMessage={validationError}
            />
            {variable.helpText && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
}
const TextVarComponent = React.memo(TextVariable);
export default TextVarComponent;

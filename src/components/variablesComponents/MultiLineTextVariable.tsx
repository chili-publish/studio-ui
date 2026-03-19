import { Input, InputLabel, Label, ValidationTypes } from '@chili-publish/grafx-shared-components';
import { LongTextVariable } from '@chili-publish/studio-sdk';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { HelpTextWrapper } from './VariablesComponents.styles';
import { ITextVariable } from './VariablesComponents.types';
import { getVariablePlaceholder } from './variablePlaceholder.util';
import { useUiConfigContext } from '../../contexts/UiConfigContext';

const MultiLineTextVariable = (props: ITextVariable<LongTextVariable>) => {
    const { variable, validationError, onValueChange } = props;
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();

    const [variableValue, setVariableValue] = useState(variable.value);
    const placeholder = getVariablePlaceholder(variable);

    useEffect(() => {
        setVariableValue(variable.value);
    }, [variable]);

    const handleVariableChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
        setVariableValue(e.target.value);
    };

    return (
        <HelpTextWrapper>
            <Input
                name="multi-line-text"
                type="textarea"
                width="100%"
                value={variableValue}
                label={
                    <Label translationKey={variable?.label ?? variable.name} value={variable?.label ?? variable.name} />
                }
                maxLength={variable.maxCharacters}
                textareaBehavior="tokenized"
                placeholder={placeholder}
                onFocus={() => onVariableFocus?.(variable.id)}
                onBlur={(event: ChangeEvent<HTMLTextAreaElement>) => {
                    const oldValue = variable.value;
                    const newValue = event.target.value;
                    onValueChange(newValue, { changed: oldValue !== newValue });
                    onVariableBlur?.(variable.id);
                }}
                onChange={handleVariableChange}
                required={variable.isRequired}
                dataId={getDataIdForSUI('multi-line-variable')}
                dataTestId={getDataTestIdForSUI('multi-line-variable')}
                validation={validationError ? ValidationTypes.ERROR : undefined}
                validationErrorMessage={validationError}
            />
            {variable.helpText && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
};
const MultiLineTextVariableComponent = React.memo(MultiLineTextVariable);
export default MultiLineTextVariableComponent;

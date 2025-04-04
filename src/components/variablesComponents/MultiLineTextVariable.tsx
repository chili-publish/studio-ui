import { Input, InputLabel, Label, ValidationTypes } from '@chili-publish/grafx-shared-components';
import { LongTextVariable, ShortTextVariable } from '@chili-publish/studio-sdk';
import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { HelpTextWrapper } from './VariablesComponents.styles';
import { ITextVariable } from './VariablesComponents.types';
import { getVariablePlaceholder } from './variablePlaceholder.util';
import { useUiConfigContext } from '../../contexts/UiConfigContext';

function MultiLineTextVariable(props: ITextVariable) {
    const { variable, validationError, onValueChange } = props;

    const { onVariableBlur, onVariableFocus } = useUiConfigContext();

    const [variableValue, setVariableValue] = useState((variable as LongTextVariable).value);
    const placeholder = getVariablePlaceholder(variable);

    useEffect(() => {
        setVariableValue((variable as ShortTextVariable).value || (variable as LongTextVariable).value);
    }, [variable]);

    const handleVariableChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
        setVariableValue(e.target.value);
    };

    const handleLineBreakKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setVariableValue((prev) => prev + (e.shiftKey ? '\n' : '\n\n'));
        }
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
                placeholder={placeholder}
                onFocus={() => onVariableFocus?.(variable.id)}
                onBlur={() => {
                    const oldValue = (variable as LongTextVariable).value;
                    onValueChange(variableValue, { changed: oldValue !== variableValue });
                    onVariableBlur?.(variable.id);
                }}
                onChange={handleVariableChange}
                isHighlightOnClick
                required={variable.isRequired}
                dataId={getDataIdForSUI('multi-line-variable')}
                dataTestId={getDataTestIdForSUI('multi-line-variable')}
                onKeyDown={handleLineBreakKeyDown}
                validation={validationError ? ValidationTypes.ERROR : undefined}
            />
            {variable.helpText && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
}
const MultiLineTextVariableComponent = React.memo(MultiLineTextVariable);
export default MultiLineTextVariableComponent;

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
        const textarea = e.target as HTMLTextAreaElement;
        const cursorPosition = textarea.selectionStart;
        const currentTextValue = textarea.value;
        if (e.key === 'Enter') {
            e.preventDefault();

            const lineBreak = e.shiftKey ? '\n' : '\n\u200B';

            const newTextValue =
                currentTextValue.substring(0, cursorPosition) + lineBreak + currentTextValue.substring(cursorPosition);

            setVariableValue(newTextValue);
            setTimeout(() => {
                textarea.selectionStart = cursorPosition + lineBreak.length;
                textarea.selectionEnd = cursorPosition + lineBreak.length;
            }, 1);
        }
    };

    return (
        <HelpTextWrapper>
            <Input
                name="multi-line-text"
                type="textarea"
                width="100%"
                value={variableValue.replace(/\n\n/g, '\n\u200B')}
                label={
                    <Label translationKey={variable?.label ?? variable.name} value={variable?.label ?? variable.name} />
                }
                placeholder={placeholder}
                onFocus={() => onVariableFocus?.(variable.id)}
                onBlur={() => {
                    const oldValue = (variable as LongTextVariable).value;
                    onValueChange(variableValue.replace(/\n\u200B/g, '\n\n'), {
                        changed: oldValue !== variableValue.replace(/\n\u200B/g, '\n\n'),
                    });
                    onVariableBlur?.(variable.id);
                }}
                onChange={handleVariableChange}
                isHighlightOnClick
                required={variable.isRequired}
                dataId={getDataIdForSUI('multi-line-variable')}
                dataTestId={getDataTestIdForSUI('multi-line-variable')}
                onKeyDown={handleLineBreakKeyDown}
                validation={validationError ? ValidationTypes.ERROR : undefined}
                validationErrorMessage={validationError}
            />
            {variable.helpText && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
}
const MultiLineTextVariableComponent = React.memo(MultiLineTextVariable);
export default MultiLineTextVariableComponent;

import { Input, InputLabel, Label, ValidationTypes } from '@chili-publish/grafx-shared-components';
import { LongTextVariable, ShortTextVariable } from '@chili-publish/studio-sdk';
import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { HelpTextWrapper } from './VariablesComponents.styles';
import { ITextVariable } from './VariablesComponents.types';
import { getVariablePlaceholder } from './variablePlaceholder.util';
import { useUiConfigContext } from '../../contexts/UiConfigContext';

const HARD_BREAK = '\n\u200B';
const SOFT_BREAK = '\n\u200C';

function MultiLineTextVariable(props: ITextVariable) {
    const { variable, validationError, onValueChange } = props;
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();

    const [variableValue, setVariableValue] = useState((variable as LongTextVariable).value);
    const placeholder = getVariablePlaceholder(variable);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setVariableValue((variable as ShortTextVariable).value || (variable as LongTextVariable).value);
    }, [variable]);

    const handleVariableChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
        setVariableValue(e.target.value);
    };

    const handleLineBreakKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const cursorPosition = textarea.selectionStart;
        const currentTextValue = textarea.value;
        if (e.key === 'Enter') {
            e.preventDefault();
            // To make the hard line break visually similar to the soft line break instead of going with \n\n
            // I went with \n\u200B (zero-width space), so it will be visiually the same but still can be targeted and replaced by \n\n
            // when sending it to the engine
            const lineBreak = e.shiftKey ? SOFT_BREAK : HARD_BREAK;
            const newTextValue =
                currentTextValue.substring(0, cursorPosition) + lineBreak + currentTextValue.substring(cursorPosition);
            textarea.value = newTextValue;
            requestAnimationFrame(() => {
                textarea.selectionStart = cursorPosition + lineBreak.length;
                textarea.selectionEnd = cursorPosition + lineBreak.length;
            });
        }

        if (e.key === 'Backspace') {
            if (
                currentTextValue.slice(cursorPosition - 2, cursorPosition) === HARD_BREAK ||
                currentTextValue.slice(cursorPosition - 2, cursorPosition) === SOFT_BREAK
            ) {
                e.preventDefault();
                const newValue = currentTextValue.slice(0, cursorPosition - 2) + currentTextValue.slice(cursorPosition);
                textarea.value = newValue;
                textarea.selectionStart = cursorPosition - 2;
                textarea.selectionEnd = cursorPosition - 2;
                return;
            }
        }

        if (e.key === 'Delete') {
            if (
                currentTextValue.slice(cursorPosition, cursorPosition + 2) === HARD_BREAK ||
                currentTextValue.slice(cursorPosition, cursorPosition + 2) === SOFT_BREAK
            ) {
                e.preventDefault();
                const newValue = currentTextValue.slice(0, cursorPosition) + currentTextValue.slice(cursorPosition + 2);
                textarea.value = newValue;
                textarea.selectionStart = cursorPosition;
                textarea.selectionEnd = cursorPosition;
            }
        }

        if (e.key === 'ArrowLeft') {
            if (
                (currentTextValue[cursorPosition - 1] === '\u200B' && currentTextValue[cursorPosition - 2] === '\n') ||
                (currentTextValue[cursorPosition - 1] === '\u200C' && currentTextValue[cursorPosition - 2] === '\n')
            ) {
                e.preventDefault();
                textarea.selectionStart = cursorPosition - 2;
                textarea.selectionEnd = cursorPosition - 2;
            }
        }

        if (e.key === 'ArrowRight') {
            if (
                currentTextValue[cursorPosition] === '\n' &&
                (currentTextValue[cursorPosition + 1] === '\u200B' || currentTextValue[cursorPosition + 1] === '\u200C')
            ) {
                e.preventDefault();
                textarea.selectionStart = cursorPosition + 2;
                textarea.selectionEnd = cursorPosition + 2;
            }
        }
    };

    return (
        <HelpTextWrapper>
            <Input
                name="multi-line-text"
                ref={textareaRef}
                type="textarea"
                width="100%"
                value={variableValue.replace(/\n\n/g, HARD_BREAK)}
                label={
                    <Label translationKey={variable?.label ?? variable.name} value={variable?.label ?? variable.name} />
                }
                placeholder={placeholder}
                onFocus={() => onVariableFocus?.(variable.id)}
                onBlur={() => {
                    const oldValue = (variable as LongTextVariable).value;
                    if (textareaRef.current) {
                        onValueChange(textareaRef.current.value.replace(/\n\u200B/g, '\n\n'), {
                            changed: oldValue !== textareaRef.current.value.replace(/\n\u200B/g, '\n\n'),
                        });
                    }
                    onVariableBlur?.(variable.id);
                }}
                onChange={handleVariableChange}
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

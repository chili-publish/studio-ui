import React, { ChangeEvent, useEffect, useState } from 'react';
import { Label, Input, InputLabel, ValidationTypes } from '@chili-publish/grafx-shared-components';
import { LongTextVariable, ShortTextVariable } from '@chili-publish/studio-sdk';
import { ITextVariable } from './VariablesComponents.types';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { HelpTextWrapper } from './VariablesComponents.styles';
import { getVariablePlaceholder } from './variablePlaceholder.util';

function TextVariable(props: ITextVariable) {
    const { variable, validationError, onValueChange } = props;

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
                onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                    const oldValue = (variable as ShortTextVariable).value || (variable as LongTextVariable).value;
                    const newValue = event.target.value;
                    onValueChange(newValue, { changed: oldValue !== newValue });
                }}
                name={variable.id}
                label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
                // TODO: uncomment when Label FF is removed from WRS
                // label={
                //     <Label
                //         translationKey={variable?.label ?? variable?.name ?? ''}
                //         value={variable?.label ?? variable?.name ?? ''}
                //     />
                // }
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

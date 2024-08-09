import { ChangeEvent, useEffect, useState } from 'react';
import { Label, Input, InputLabel } from '@chili-publish/grafx-shared-components';
import { LongTextVariable, ShortTextVariable } from '@chili-publish/studio-sdk';
import { ITextVariable } from './VariablesComponents.types';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { HelpTextWrapper } from './VariablesComponents.styles';
import { getVariablePlaceholder } from './variablePlaceholder.util';

function TextVariable(props: ITextVariable) {
    const { handleValueChange, variable } = props;

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
                onChange={handleVariableChange}
                onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                    const oldValue = (variable as ShortTextVariable).value || (variable as LongTextVariable).value;
                    const newValue = event.target.value;
                    if (oldValue !== newValue) handleValueChange(newValue);
                }}
                name={variable.id}
                label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
            />
            {variable.helpText ? <InputLabel labelFor={variable.id} label={variable.helpText} /> : null}
        </HelpTextWrapper>
    );
}
export default TextVariable;

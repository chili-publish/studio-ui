import { ChangeEvent, useEffect, useState } from 'react';
import { Label, Input } from '@chili-publish/grafx-shared-components';
import { LongTextVariable, ShortTextVariable } from '@chili-publish/studio-sdk';
import { ITextVariable } from './VariablesComponents.types';

function TextVariable(props: ITextVariable) {
    const { handleValueChange, variable } = props;

    const [variableValue, setVariableValue] = useState(
        (variable as ShortTextVariable).value || (variable as LongTextVariable).value,
    );

    useEffect(() => {
        const newValue = (variable as ShortTextVariable).value || (variable as LongTextVariable).value;
        if (newValue !== variableValue) {
            setVariableValue((variable as ShortTextVariable).value || (variable as LongTextVariable).value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [variable]);

    const handleVariableChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (variableValue !== e.target.value) setVariableValue(e.target.value);
    };

    return (
        <Input
            type="text"
            value={variableValue}
            onChange={handleVariableChange}
            onBlur={(event: ChangeEvent<HTMLInputElement>) => handleValueChange(event.target.value)}
            name={variable.id}
            label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
        />
    );
}
export default TextVariable;

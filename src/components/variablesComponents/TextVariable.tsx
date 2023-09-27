import { ChangeEvent, useEffect, useState } from 'react';
import { Label, Input, getDataId, getDataTestId } from '@chili-publish/grafx-shared-components';
import { LongTextVariable, ShortTextVariable } from '@chili-publish/studio-sdk';
import { ITextVariable } from './VariablesComponents.types';

function TextVariable(props: ITextVariable) {
    const { handleValueChange, variable } = props;

    const [variableValue, setVariableValue] = useState(
        (variable as ShortTextVariable).value || (variable as LongTextVariable).value,
    );

    useEffect(() => {
        setVariableValue((variable as ShortTextVariable).value || (variable as LongTextVariable).value);
    }, [variable]);

    const handleVariableChange = async (e: ChangeEvent<HTMLInputElement>) => {
        setVariableValue(e.target.value);
    };

    return (
        <Input
            type="text"
            dataId={getDataId(`input-${variable.id}`, 'sui')}
            dataTestId={getDataTestId(`input-${variable.id}`, 'sui')}
            value={variableValue}
            onChange={handleVariableChange}
            onBlur={(event: ChangeEvent<HTMLInputElement>) => handleValueChange(event.target.value)}
            name={variable.id}
            label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
        />
    );
}
export default TextVariable;

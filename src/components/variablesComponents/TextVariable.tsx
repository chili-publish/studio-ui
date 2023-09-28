import { ChangeEvent, useEffect, useState } from 'react';
import { Label, Input } from '@chili-publish/grafx-shared-components';
import { LongTextVariable, ShortTextVariable } from '@chili-publish/studio-sdk';
import { ITextVariable } from './VariablesComponents.types';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';

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
            dataId={getDataIdForSUI(`input-${variable.id}`)}
            dataTestId={getDataTestIdForSUI(`input-${variable.id}`)}
            value={variableValue}
            onChange={handleVariableChange}
            onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                const oldValue = (variable as ShortTextVariable).value || (variable as LongTextVariable).value;
                const newValue = event.target.value;
                if (oldValue !== newValue) handleValueChange(newValue);
            }}
            name={variable.id}
            label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
        />
    );
}
export default TextVariable;

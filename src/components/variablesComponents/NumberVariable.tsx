import { ChangeEvent, useEffect, useState } from 'react';
import { Label, Input } from '@chili-publish/grafx-shared-components';
import { INumberVariable } from './VariablesComponents.types';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';

function NumberVariable(props: INumberVariable) {
    const { handleValueChange, variable } = props;

    const [variableValue, setVariableValue] = useState(variable.value);

    useEffect(() => {
        setVariableValue(variable.value);
    }, [variable]);

    const handleVariableChange = async (e: ChangeEvent<HTMLInputElement>) => {
        setVariableValue(Number(e.target.value));
    };

    return (
        <Input
            type="number"
            name={variable.id}
            label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
            value={`${variableValue}`}
            step={variable.showStepper ? variable.stepSize : undefined}
            dataId={getDataIdForSUI(`input-number-${variable.id}`)}
            dataTestId={getDataTestIdForSUI(`input-number-${variable.id}`)}
            dataIntercomId={`input-variable-${variable.name}`}
            precision={2}
            onChange={handleVariableChange}
            onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                const prevValue = String(variable.value);
                const currentValue = event.target.value;
                if (prevValue !== currentValue) handleValueChange(Number(currentValue));
            }}
            onValueChange={(value: string) => {
                const prevValue = String(variable.value);
                const currentValue = value;
                if (prevValue !== currentValue) handleValueChange(Number(currentValue));
            }}
            disabled={variable.isReadonly}
        />
    );
}
export default NumberVariable;

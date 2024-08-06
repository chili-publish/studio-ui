import { Label, Input } from '@chili-publish/grafx-shared-components';
import { ChangeEvent } from 'react';
import { INumberVariable } from './VariablesComponents.types';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';

function NumberVariable(props: INumberVariable) {
    const { handleValueChange, variable } = props;

    return (
        <Input
            type="number"
            name={variable.id}
            min={variable.minValue}
            max={variable.maxValue}
            precision={variable.numberOfDecimals}
            label={<Label translationKey={variable?.name ?? ''} value={variable?.name ?? ''} />}
            value={`${variable.value}`}
            step={variable.showStepper ? variable.stepSize : undefined}
            dataId={getDataIdForSUI(`input-number-${variable.id}`)}
            dataTestId={getDataTestIdForSUI(`input-number-${variable.id}`)}
            dataIntercomId={`input-variable-${variable.name}`}
            onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                const currentValue = parseFloat(event.target.value.replace(',', '.'));
                const prevValue = variable.value;
                if (prevValue !== currentValue) {
                    handleValueChange(currentValue);
                }
            }}
            onValueChange={(value: string) => {
                const currentValue = parseFloat(value.replace(',', '.'));
                const prevValue = variable.value;
                if (prevValue !== currentValue) {
                    handleValueChange(currentValue);
                }
            }}
            disabled={variable.isReadonly}
        />
    );
}
export default NumberVariable;

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
            value={`${variable.value}`.replace('.', variable.decimalSeparator)}
            step={variable.showStepper ? variable.stepSize : undefined}
            dataId={getDataIdForSUI(`input-number-${variable.id}`)}
            dataTestId={getDataTestIdForSUI(`input-number-${variable.id}`)}
            dataIntercomId={`input-variable-${variable.name}`}
            onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                const prevValue = String(variable.value);
                const currentValue = event.target.value;
                if (prevValue !== currentValue)
                    // TODO : remove type casting when SDK numbers PR is merged
                    handleValueChange(
                        Number(currentValue.replace(variable.decimalSeparator, '.')) as unknown as string,
                    );
            }}
            onValueChange={(value: string) => {
                const prevValue = String(variable.value);
                const currentValue = value;
                if (prevValue !== currentValue)
                    // TODO : remove type casting when SDK numbers PR is merged
                    handleValueChange(
                        Number(currentValue.replace(variable.decimalSeparator, '.')) as unknown as string,
                    );
            }}
            disabled={variable.isReadonly}
        />
    );
}
export default NumberVariable;

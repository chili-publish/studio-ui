import { Colors, Switch, SwitchSize } from '@chili-publish/grafx-shared-components';
import { useState } from 'react';
import { BooleanVariable } from '@chili-publish/studio-sdk';
import { IBooleanVariable } from './VariablesComponents.types';

function BooleanVariable(props: IBooleanVariable) {
    const { variable, handleValueChange } = props;
    const [state, setState] = useState((variable as BooleanVariable).value);

    return (
        <div
            style={{
                height: '2.5rem',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Switch
                isChecked={state}
                name="booleanValue"
                label={{
                    key: 'visible',
                    value: variable.name,
                }}
                onChange={(val: boolean) => {
                    handleValueChange(val);
                    setState(val);
                }}
                labelColor={Colors.SECONDARY_FONT}
                size={SwitchSize.LARGE}
            />
        </div>
    );
}

export default BooleanVariable;

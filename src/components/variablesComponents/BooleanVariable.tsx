import { Colors, Switch, SwitchSize } from '@chili-publish/grafx-shared-components';
import { useState } from 'react';
import { BooleanVariable } from '@chili-publish/studio-sdk';
import { IBooleanVariable } from './VariablesComponents.types';
import { BooleanVariableContainer } from './VariablesComponents.styles';

function BooleanVariable(props: IBooleanVariable) {
    const { variable, handleValueChange } = props;
    const [state, setState] = useState((variable as BooleanVariable).value);

    return (
        <BooleanVariableContainer>
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
        </BooleanVariableContainer>
    );
}

export default BooleanVariable;

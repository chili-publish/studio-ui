import { Colors, Switch, SwitchSize } from '@chili-publish/grafx-shared-components';
import { useEffect, useState } from 'react';
import { BooleanVariable } from '@chili-publish/studio-sdk';
import { IBooleanVariable } from './VariablesComponents.types';
import { BooleanVariableContainer } from './VariablesComponents.styles';

function BooleanVariable(props: IBooleanVariable) {
    const { variable, handleValueChange } = props;
    const [toggled, setToggled] = useState((variable as BooleanVariable).value);

    useEffect(() => {
        setToggled((variable as BooleanVariable).value);
    }, [variable]);

    return (
        <BooleanVariableContainer>
            <Switch
                isChecked={toggled}
                id={variable.id}
                label={{
                    key: 'visible',
                    value: variable.name,
                }}
                onChange={(val: boolean) => {
                    handleValueChange(val);
                    setToggled(val);
                }}
                labelColor={Colors.SECONDARY_FONT}
                size={SwitchSize.LARGE}
                noLabelHeight
            />
        </BooleanVariableContainer>
    );
}

export default BooleanVariable;

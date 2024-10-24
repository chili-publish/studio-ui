import { InputLabel, Switch } from '@chili-publish/grafx-shared-components';
import { useEffect, useState } from 'react';
import { BooleanVariable } from '@chili-publish/studio-sdk';
import { IBooleanVariable } from './VariablesComponents.types';
import { BooleanVariableContainer, HelpTextWrapper } from './VariablesComponents.styles';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';

function BooleanVariable(props: IBooleanVariable) {
    const { variable, handleValueChange } = props;
    const [toggled, setToggled] = useState((variable as BooleanVariable).value);

    useEffect(() => {
        setToggled((variable as BooleanVariable).value);
    }, [variable]);

    return (
        <HelpTextWrapper>
            <BooleanVariableContainer data-intercom-target={`boolean-variable-${variable.name}`}>
                <Switch
                    dataId={getDataIdForSUI(`switch-${variable.id}`)}
                    dataTestId={getDataTestIdForSUI(`switch-${variable.id}`)}
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
                    noLabelHeight
                />
            </BooleanVariableContainer>
            {variable.helpText ? <InputLabel labelFor={variable.id} label={variable.helpText} /> : null}
        </HelpTextWrapper>
    );
}

export default BooleanVariable;

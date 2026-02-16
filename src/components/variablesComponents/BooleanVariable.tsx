import { InputLabel, Switch } from '@chili-publish/grafx-shared-components';
import type { BooleanVariable as BooleanVariableType } from '@chili-publish/studio-sdk';
import { useEffect, useState } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { BooleanVariableContainer, HelpTextWrapper } from './VariablesComponents.styles';
import { IBooleanVariable } from './VariablesComponents.types';
import { useUiConfigContext } from '../../contexts/UiConfigContext';

const BooleanVariable = (props: IBooleanVariable) => {
    const { variable, handleValueChange } = props;
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();

    const [toggled, setToggled] = useState((variable as BooleanVariableType).value);

    useEffect(() => {
        setToggled((variable as BooleanVariableType).value);
    }, [variable]);

    return (
        <HelpTextWrapper>
            <BooleanVariableContainer data-intercom-target={`boolean-variable-${variable.name}`}>
                <Switch
                    dataId={getDataIdForSUI(`switch-${variable.id}`)}
                    dataTestId={getDataTestIdForSUI(`switch-${variable.id}`)}
                    isChecked={toggled}
                    id={`ui-${variable.id}`}
                    label={{
                        key: 'visible',
                        value: variable.label ?? variable.name,
                    }}
                    onChange={(val: boolean) => {
                        handleValueChange(val);
                        setToggled(val);
                        onVariableFocus?.(variable.id);
                        onVariableBlur?.(variable.id);
                    }}
                    noLabelHeight
                />
            </BooleanVariableContainer>
            {variable.helpText ? <InputLabel labelFor={variable.id} label={variable.helpText} /> : null}
        </HelpTextWrapper>
    );
};

export default BooleanVariable;

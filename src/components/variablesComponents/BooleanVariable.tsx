import { InputLabel, Switch } from '@chili-publish/grafx-shared-components';
import { useEffect, useState } from 'react';
import type { BooleanVariable } from '@chili-publish/studio-sdk';
import { useFeatureFlagContext } from '../../contexts/FeatureFlagProvider';
import { IBooleanVariable } from './VariablesComponents.types';
import { BooleanVariableContainer, HelpTextWrapper } from './VariablesComponents.styles';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';

function BooleanVariable(props: IBooleanVariable) {
    const { variable, handleValueChange } = props;
    const { featureFlags } = useFeatureFlagContext();
    const [toggled, setToggled] = useState((variable as BooleanVariable).value);

    useEffect(() => {
        // eslint-disable-next-line no-console
        console.log('is toggles', variable);
        setToggled((variable as BooleanVariable).value);
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
                        value: featureFlags?.STUDIO_LABEL_PROPERTY_ENABLED ? variable.label : variable.name,
                    }}
                    onChange={(val: boolean) => {
                        // eslint-disable-next-line no-console
                        console.log('on boolean var change', val);
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

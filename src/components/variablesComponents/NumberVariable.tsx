import { Label, Input, InputLabel, ValidationTypes } from '@chili-publish/grafx-shared-components';
import { ChangeEvent } from 'react';
import { useFeatureFlagContext } from 'src/contexts/FeatureFlagProvider';
import { INumberVariable } from './VariablesComponents.types';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { HelpTextWrapper } from './VariablesComponents.styles';

function NumberVariable(props: INumberVariable) {
    const { variable, validationError, onValueChange } = props;
    const { featureFlags } = useFeatureFlagContext();

    return (
        <HelpTextWrapper>
            <Input
                type="number"
                name={variable.id}
                min={variable.minValue}
                max={variable.maxValue}
                precision={variable.numberOfDecimals}
                label={
                    <Label
                        translationKey={featureFlags?.STUDIO_LABEL_PROPERTY_ENABLED ? variable.label : variable.name}
                        value={featureFlags?.STUDIO_LABEL_PROPERTY_ENABLED ? variable.label : variable.name}
                    />
                }
                value={`${variable.value}`}
                step={variable.showStepper ? variable.stepSize : undefined}
                dataId={getDataIdForSUI(`input-number-${variable.id}`)}
                dataTestId={getDataTestIdForSUI(`input-number-${variable.id}`)}
                dataIntercomId={`input-variable-${variable.name}`}
                onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                    const currentValue = parseFloat(event.target.value.replace(',', '.'));
                    const prevValue = variable.value;
                    onValueChange(currentValue, { changed: prevValue !== currentValue });
                }}
                onValueChange={(value: string) => {
                    const currentValue = parseFloat(value.replace(',', '.'));
                    const prevValue = variable.value;
                    onValueChange(currentValue, { changed: prevValue !== currentValue });
                }}
                disabled={variable.isReadonly}
                required={variable.isRequired}
                validation={validationError ? ValidationTypes.ERROR : undefined}
                validationErrorMessage={validationError}
            />
            {variable.helpText && !validationError ? (
                <InputLabel labelFor={variable.id} label={variable.helpText} />
            ) : null}
        </HelpTextWrapper>
    );
}
export default NumberVariable;

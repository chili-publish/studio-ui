import { ChangeEvent } from 'react';
import { Input } from '@chili-publish/grafx-shared-components';
import { LayoutPropertiesType, MeasurementUnit } from '@chili-publish/studio-sdk';
import { LayoutInputsContainer } from './Layout.styles';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { useUiConfigContext } from '../../contexts/UiConfigContext';
import { useLayoutProperties } from './useLayoutProperties';
import { formatNumber } from './utils';
import { LayoutInputId, LayoutPropertyMap } from './types';

interface LayoutPropertiesProps {
    layout: LayoutPropertiesType;
}

function LayoutProperties({ layout }: LayoutPropertiesProps) {
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();
    const { layoutHeight, layoutWidth, handleChange } = useLayoutProperties(layout);

    const handleFocus = (inputId: string) => {
        onVariableFocus?.(inputId);
    };

    const handleBlur = (inputId: LayoutInputId, value: string) => {
        onVariableBlur?.(inputId);
        handleChange(LayoutPropertyMap[inputId], value);
    };

    const renderInput = (id: string, inputValue: string, label: string) => (
        <Input
            type="number"
            id={id}
            dataId={getDataIdForSUI(id)}
            dataTestId={getDataTestIdForSUI(id)}
            value={inputValue}
            placeholder={label}
            onValueChange={(v) => {
                handleChange(LayoutPropertyMap[id as LayoutInputId], v);
            }}
            onFocus={() => handleFocus(id)}
            onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                const property = LayoutPropertyMap[id as LayoutInputId];
                const { value } = event.target;
                const oldValue = (layout?.[property as keyof LayoutPropertiesType] as Record<string, unknown>)
                    ?.value as number;
                const isSame =
                    `${formatNumber(
                        oldValue as number,
                        (layout?.unit as Record<string, unknown>).value as MeasurementUnit,
                    )} ${(layout?.unit as Record<string, unknown>).value as MeasurementUnit}` === value;

                if (!isSame) {
                    handleBlur(id as LayoutInputId, event.target.value);
                }
            }}
            name={id}
            label={label}
        />
    );

    return (
        <LayoutInputsContainer>
            {renderInput('layout-width-input', layoutWidth, 'Width')}
            {renderInput('layout-height-input', layoutHeight, 'Height')}
        </LayoutInputsContainer>
    );
}
export default LayoutProperties;

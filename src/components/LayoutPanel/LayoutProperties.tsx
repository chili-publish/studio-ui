import { ChangeEvent } from 'react';
import { Input } from '@chili-publish/grafx-shared-components';
import { LayoutPropertiesType, MeasurementUnit, Page } from '@chili-publish/studio-sdk';
import { LayoutInputsContainer } from './Layout.styles';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { useUiConfigContext } from '../../contexts/UiConfigContext';
import { useLayoutProperties } from './useLayoutProperties';
import { PageInputId, PagePropertyMap } from './types';
import { formatNumber } from '../../utils/formatNumber';

interface LayoutPropertiesProps {
    layout: LayoutPropertiesType;
    activePageDetails?: Page;
}

function LayoutProperties({ layout, activePageDetails }: LayoutPropertiesProps) {
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();
    const { handleChange, pageWidth, pageHeight } = useLayoutProperties(layout, activePageDetails);

    const handleFocus = (inputId: string) => {
        onVariableFocus?.(inputId);
    };

    const handleBlur = (inputId: PageInputId, value: string) => {
        onVariableBlur?.(inputId);
        handleChange(PagePropertyMap[inputId], value);
    };

    const handleInputBlur = (id: string) => (event: ChangeEvent<HTMLInputElement>) => {
        const property = PagePropertyMap[id as PageInputId]; // width or height
        const newValue = event.target.value;
        const oldValue = activePageDetails?.[property as keyof Page] as number;
        const isSame =
            `${formatNumber(oldValue as number, (layout?.unit as Record<string, unknown>).value as MeasurementUnit)} ${
                (layout?.unit as Record<string, unknown>).value as MeasurementUnit
            }` === newValue;
        if (!isSame) {
            handleBlur(id as PageInputId, newValue);
        }
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
                handleChange(PagePropertyMap[id as PageInputId], v);
            }}
            onFocus={() => handleFocus(id)}
            onBlur={handleInputBlur(id)}
            name={id}
            label={label}
        />
    );

    return (
        <LayoutInputsContainer>
            {renderInput('page-width-input', pageWidth, 'Width')}
            {renderInput('page-height-input', pageHeight, 'Height')}
        </LayoutInputsContainer>
    );
}
export default LayoutProperties;

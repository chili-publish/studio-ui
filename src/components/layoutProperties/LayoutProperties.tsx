import { AvailableIcons, Icon, Input, Tooltip, TooltipPosition } from '@chili-publish/grafx-shared-components';
import { ConstraintMode, LayoutPropertiesType, PageSize } from '@chili-publish/studio-sdk';
import { ChangeEvent } from 'react';
import { useUiConfigContext } from '../../contexts/UiConfigContext';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { formatNumber } from '../../utils/formatNumber';
import { IconWrapper, LayoutInputsContainer } from './Layout.styles';
import { PageInputId, PagePropertyMap } from './types';
import { useLayoutProperties } from './useLayoutProperties';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import { APP_WRAPPER_ID } from 'src/utils/constants';

interface LayoutPropertiesProps {
    layout: LayoutPropertiesType;
    pageSize?: PageSize;
}

function LayoutProperties({ layout, pageSize }: LayoutPropertiesProps) {
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();
    const { handleChange, pageWidth, pageHeight, widthInputHelpText, heightInputHelpText } = useLayoutProperties(
        layout,
        pageSize,
    );

    const { getUITranslation } = useUITranslations();

    const widthLabel = getUITranslation(['formBuilder', 'layouts', 'width'], 'Width');
    const heightLabel = getUITranslation(['formBuilder', 'layouts', 'height'], 'Height');

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
        const oldValue = pageSize?.[property as keyof PageSize] as number;
        const isSame = `${formatNumber(oldValue, layout?.unit.value)} ${layout?.unit.value}` === newValue;
        if (!isSame) {
            handleBlur(id as PageInputId, newValue);
        }
    };
    const renderInput = (id: string, inputValue: string, label: string, helpText?: string) => (
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
            helpText={helpText}
        />
    );

    return (
        <LayoutInputsContainer>
            {renderInput('page-width-input', pageWidth, widthLabel, widthInputHelpText)}
            {layout?.resizableByUser.constraintMode === ConstraintMode.locked ? (
                <IconWrapper>
                    <Tooltip
                        content={getUITranslation(
                            ['formBuilder', 'layouts', 'lockConstraintTooltip'],
                            'Proportions are locked',
                        )}
                        position={TooltipPosition.TOP}
                        anchorId={APP_WRAPPER_ID}
                    >
                        <Icon
                            icon={AvailableIcons.faLock}
                            dataId={getDataIdForSUI(`layout-constraint-icon-${layout.resizableByUser.constraintMode}`)}
                            dataTestId={getDataTestIdForSUI(
                                `layout-constraint-icon-${layout.resizableByUser.constraintMode}`,
                            )}
                        />
                    </Tooltip>
                </IconWrapper>
            ) : null}
            {renderInput('page-height-input', pageHeight, heightLabel, heightInputHelpText)}
        </LayoutInputsContainer>
    );
}
export default LayoutProperties;

import { Button, ButtonVariant, Input, Label, ValidationTypes } from '@chili-publish/grafx-shared-components';
import { LayoutPropertiesType, PageSize } from '@chili-publish/studio-sdk';
import { ChangeEvent } from 'react';
import { useUiConfigContext } from '../../contexts/UiConfigContext';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { formatNumber } from '../../utils/formatNumber';
import { ButtonsWrapper, IconWrapper, LayoutInputsContainer } from './Layout.styles';
import { PageInputId, PagePropertyMap, PagePropertyType } from './types';
import { useLayoutProperties } from './useLayoutProperties';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import RangeConstraintIcon from './RangeConstraintIcon';
import LockedConstraintIcon from './LockedConstraintIcon';
import { useLayoutConstraintProportions } from './useLayoutConstraintProportions';
import { withMeasurementUnit } from './util';
import RangeConstraintErrorMessage from './RangeConstraintErrorMessage';

interface LayoutPropertiesProps {
    layout: LayoutPropertiesType;
    pageSize?: PageSize;
}

function LayoutProperties({ layout, pageSize }: LayoutPropertiesProps) {
    const { onVariableBlur, onVariableFocus } = useUiConfigContext();
    const { saveChange, pageWidth, pageHeight, widthInputHelpText, heightInputHelpText, setPageWidth, setPageHeight } =
        useLayoutProperties(layout, pageSize);

    const {
        formHasChanges,
        setFormHasChanges,
        formHasError,
        setFormHasError,
        handleSubmitChanges,
        hasLockedConstraint,
        hasRangeConstraint,
    } = useLayoutConstraintProportions({
        layout,
        pageWidth,
        pageHeight,
    });
    const submitOnBlur = !hasRangeConstraint;

    const { getUITranslation } = useUITranslations();

    const widthLabel = getUITranslation(['formBuilder', 'layouts', 'width'], 'Width');
    const heightLabel = getUITranslation(['formBuilder', 'layouts', 'height'], 'Height');

    const handleFocus = (inputId: string) => {
        onVariableFocus?.(inputId);
    };

    const handleBlur = async (inputId: PageInputId, value: string) => {
        onVariableBlur?.(inputId);

        if (submitOnBlur) {
            saveChange(PagePropertyMap[inputId], value);
        } else {
            setFormHasChanges(true);
            // update state with new value to reflect it in the inputs before submit
            if (PagePropertyMap[inputId] === PagePropertyType.Width) {
                const width = (await window.StudioUISDK.utils.unitEvaluate(value, layout?.unit.value)).parsedData;
                setPageWidth(withMeasurementUnit(width ?? 0, layout?.unit.value));
            } else {
                const height = (await window.StudioUISDK.utils.unitEvaluate(value, layout?.unit.value)).parsedData;
                setPageHeight(withMeasurementUnit(height ?? 0, layout?.unit.value));
            }
        }
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

    const handleRevertChanges = () => {
        setFormHasError(false);
        setFormHasChanges(false);

        setPageWidth(pageSize?.width ? withMeasurementUnit(pageSize.width, layout?.unit.value) : '');
        setPageHeight(pageSize?.height ? withMeasurementUnit(pageSize.height, layout?.unit.value) : '');
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
                setFormHasChanges(true);
                if (submitOnBlur) saveChange(PagePropertyMap[id as PageInputId], v);
            }}
            onFocus={() => handleFocus(id)}
            onBlur={handleInputBlur(id)}
            name={id}
            label={label}
            helpText={helpText}
            validation={formHasError ? ValidationTypes.ERROR : undefined}
        />
    );

    return (
        <>
            <LayoutInputsContainer>
                {renderInput('page-width-input', pageWidth, widthLabel, widthInputHelpText)}
                {hasLockedConstraint && (
                    <IconWrapper hasHelpText={!!widthInputHelpText || !!heightInputHelpText}>
                        <LockedConstraintIcon layout={layout} />
                    </IconWrapper>
                )}
                {hasRangeConstraint && (
                    <IconWrapper hasHelpText={!!widthInputHelpText || !!heightInputHelpText}>
                        <RangeConstraintIcon layout={layout} />
                    </IconWrapper>
                )}
                {renderInput('page-height-input', pageHeight, heightLabel, heightInputHelpText)}
            </LayoutInputsContainer>
            {hasRangeConstraint && (
                <>
                    <ButtonsWrapper>
                        <Button
                            disabled={!formHasChanges}
                            variant={ButtonVariant.secondary}
                            onClick={handleRevertChanges}
                            label={
                                <Label
                                    translationKey="cancelLabel"
                                    value={getUITranslation(['formBuilder', 'layouts', 'cancelLabel'], 'Cancel')}
                                />
                            }
                        />
                        <Button
                            disabled={!formHasChanges}
                            variant={ButtonVariant.primary}
                            onClick={handleSubmitChanges}
                            label={
                                <Label
                                    translationKey="applyLabel"
                                    value={getUITranslation(['formBuilder', 'layouts', 'applyLabel'], 'Apply')}
                                />
                            }
                        />
                    </ButtonsWrapper>
                    {formHasError && (
                        <RangeConstraintErrorMessage
                            currentWidth={pageWidth}
                            currentHeight={pageHeight}
                            unit={layout?.unit.value}
                            layout={layout}
                        />
                    )}
                </>
            )}
        </>
    );
}
export default LayoutProperties;

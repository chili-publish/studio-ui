import {
    Button,
    ButtonVariant,
    Input,
    Label,
    ValidationTypes,
    TooltipVariant,
    TooltipPosition,
} from '@chili-publish/grafx-shared-components';
import { LayoutPropertiesType, PageSize } from '@chili-publish/studio-sdk';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { formatNumber } from '../../utils/formatNumber';
import { ButtonsWrapper, ErrorMessageContainer, IconWrapper, LayoutInputsContainer } from './Layout.styles';
import { PageInputId, PagePropertyMap, PagePropertyType } from './types';
import { useLayoutProperties } from './useLayoutProperties';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import RangeConstraintIcon from './RangeConstraintIcon';
import LockedConstraintIcon from './LockedConstraintIcon';
import { useLayoutConstraintProportions } from './useLayoutConstraintProportions';
import { clampValue, withMeasurementUnit } from './util';
import { ErrorMessage } from '../shared/ErrorMessage.styles';
import RangeConstraintErrorMessage from './RangeConstraintErrorMessage';

interface LayoutPropertiesProps {
    layout: LayoutPropertiesType;
    pageSize?: PageSize;
}

const LayoutProperties = ({ layout, pageSize }: LayoutPropertiesProps) => {
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

    const handleBlur = async (inputId: PageInputId, value: string) => {
        if (submitOnBlur) {
            saveChange(PagePropertyMap[inputId], value);
        } else {
            setFormHasChanges(true);
            // update state with new value to reflect it in the inputs before submit
            if (PagePropertyMap[inputId] === PagePropertyType.Width) {
                try {
                    const width = (await window.StudioUISDK.utils.unitEvaluate(value, layout?.unit.value)).parsedData;
                    const clampedWidth = clampValue(
                        width,
                        layout?.resizableByUser.minWidth,
                        layout?.resizableByUser.maxWidth,
                    );
                    setPageWidth(withMeasurementUnit(clampedWidth ?? pageSize?.width ?? 0, layout?.unit.value));
                } catch (err) {
                    setPageWidth(withMeasurementUnit(pageSize?.width ?? 0, layout?.unit.value));
                }
            } else {
                try {
                    const height = (await window.StudioUISDK.utils.unitEvaluate(value, layout?.unit.value)).parsedData;
                    const clampedHeight = clampValue(
                        height,
                        layout?.resizableByUser.minHeight,
                        layout?.resizableByUser.maxHeight,
                    );
                    setPageHeight(withMeasurementUnit(clampedHeight ?? pageSize?.height ?? 0, layout?.unit.value));
                } catch (err) {
                    setPageHeight(withMeasurementUnit(pageSize?.height ?? 0, layout?.unit.value));
                }
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

    const renderInput = (
        id: string,
        inputValue: string,
        setValue: Dispatch<SetStateAction<string>>,
        label: string,
        helpText?: string,
    ) => (
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
            onChange={(ev) => {
                if (!submitOnBlur) setValue(ev.target.value);
            }}
            onBlur={handleInputBlur(id)}
            name={id}
            label={label}
            helpText={helpText}
            validation={formHasError ? ValidationTypes.ERROR : undefined}
            validationErrorInTooltip={{ enabled: true, position: TooltipPosition.TOP, variant: TooltipVariant.DEFAULT }}
            validationErrorMessage={
                <RangeConstraintErrorMessage
                    currentWidth={pageWidth}
                    currentHeight={pageHeight}
                    unit={layout?.unit.value}
                    layout={layout}
                />
            }
        />
    );

    return (
        <>
            <LayoutInputsContainer data-testid={`${getDataTestIdForSUI('layout-properties-inputs')}`}>
                {renderInput('page-width-input', pageWidth, setPageWidth, widthLabel, widthInputHelpText)}
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
                {renderInput('page-height-input', pageHeight, setPageHeight, heightLabel, heightInputHelpText)}
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
                        <ErrorMessageContainer>
                            <ErrorMessage>
                                {getUITranslation(
                                    ['formBuilder', 'layouts', 'errorRangeConstraintMessage'],
                                    'Only specific aspect ratios are supported.',
                                )}
                            </ErrorMessage>
                        </ErrorMessageContainer>
                    )}
                </>
            )}
        </>
    );
};
export default LayoutProperties;

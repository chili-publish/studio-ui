import { AvailableIcons, Icon, Tooltip, TooltipPosition } from '@chili-publish/grafx-shared-components';
import { APP_WRAPPER_ID } from 'src/utils/constants';
import { useUITranslations } from 'src/core/hooks/useUITranslations';
import { useMemo } from 'react';
import { LayoutPropertiesType, MeasurementUnit } from '@chili-publish/studio-sdk';
import { ErrorMessage } from '../shared/ErrorMessage.styles';
import { ErrorMessageContainer } from './Layout.styles';
import { getInputValueAndUnit, roundValue } from './util';

interface RangeConstraintErrorMessageProps {
    currentWidth: string;
    currentHeight: string;
    unit: MeasurementUnit | undefined;
    layout: LayoutPropertiesType;
}
function RangeConstraintErrorMessage({ currentWidth, currentHeight, unit, layout }: RangeConstraintErrorMessageProps) {
    const { getUITranslation } = useUITranslations();

    const uiTranslation = useMemo(() => {
        const { value: numericCurrentWidth, unit: currentWidthUnit } = getInputValueAndUnit(currentWidth, unit);
        const { value: numericCurrentHeight, unit: currentHeightUnit } = getInputValueAndUnit(currentHeight, unit);

        if (layout?.resizableByUser.minAspect && layout?.resizableByUser.maxAspect) {
            const minHorizontal = layout.resizableByUser.minAspect.horizontal;
            const minVertical = layout.resizableByUser.minAspect.vertical;
            const maxHorizontal = layout.resizableByUser.maxAspect.horizontal;
            const maxVertical = layout.resizableByUser.maxAspect.vertical;

            const heightRange = [
                (numericCurrentWidth / minHorizontal) * minVertical,
                (numericCurrentWidth / maxHorizontal) * maxVertical,
            ].sort((a, b) => a - b);

            const widthRange = [
                (numericCurrentHeight / minVertical) * minHorizontal,
                (numericCurrentHeight / maxVertical) * maxHorizontal,
            ].sort((a, b) => a - b);

            const minHeight = roundValue(heightRange[0]);
            const maxHeight = roundValue(heightRange[1]);
            const minWidth = roundValue(widthRange[0]);
            const maxWidth = roundValue(widthRange[1]);

            return getUITranslation(
                ['formBuilder', 'layouts', 'errorRangeConstraintTooltip'],
                `To respect the allowed proportions (${minHorizontal}:${minVertical} to ${maxHorizontal}:${maxVertical}):
                \n• If the width is ${numericCurrentWidth} ${currentWidthUnit}, the height must be between ${minHeight} ${currentWidthUnit} and ${maxHeight} ${currentWidthUnit}
                \n• If the height is ${numericCurrentHeight} ${currentHeightUnit}, the width must be between ${minWidth} ${currentHeightUnit} and ${maxWidth} ${currentHeightUnit}`,
                {
                    minHorizontal: minHorizontal.toString(),
                    minVertical: minVertical.toString(),
                    maxHorizontal: maxHorizontal.toString(),
                    maxVertical: maxVertical.toString(),
                    currentWidth: numericCurrentWidth.toString(),
                    currentHeight: numericCurrentHeight.toString(),
                    currentWidthUnit: currentWidthUnit || '',
                    currentHeightUnit: currentHeightUnit || '',
                },
            );
        }

        if (layout?.resizableByUser.minAspect) {
            const minHorizontal = layout.resizableByUser.minAspect.horizontal;
            const minVertical = layout.resizableByUser.minAspect.vertical;

            const maxHeight = roundValue((numericCurrentWidth / minHorizontal) * minVertical);
            const minWidth = roundValue((numericCurrentHeight / minVertical) * minHorizontal);

            return getUITranslation(
                ['formBuilder', 'layouts', 'errorMinRangeConstraintTooltip'],
                `To respect the allowed proportions (min ${minHorizontal}:${minVertical}):
                \n• If the width is ${numericCurrentWidth} ${currentWidthUnit}, the height must be lower than ${maxHeight} ${currentWidthUnit}
                \n• If the height is ${numericCurrentHeight} ${currentHeightUnit}, the width must be higher than ${minWidth} ${currentHeightUnit}`,
                {
                    minHorizontal: minHorizontal.toString(),
                    minVertical: minVertical.toString(),
                    currentWidth: numericCurrentWidth.toString(),
                    currentHeight: numericCurrentHeight.toString(),
                    minWidth: minWidth.toString(),
                    maxHeight: maxHeight.toString(),
                    currentWidthUnit: currentWidthUnit || '',
                    currentHeightUnit: currentHeightUnit || '',
                },
            );
        }

        if (layout?.resizableByUser.maxAspect) {
            const maxHorizontal = layout.resizableByUser.maxAspect.horizontal;
            const maxVertical = layout.resizableByUser.maxAspect.vertical;

            const minHeight = roundValue((numericCurrentWidth / maxHorizontal) * maxVertical);
            const maxWidth = roundValue((numericCurrentHeight / maxVertical) * maxHorizontal);

            return getUITranslation(
                ['formBuilder', 'layouts', 'errorMaxRangeConstraintTooltip'],
                `To respect the allowed proportions (max ${maxHorizontal}:${maxVertical}):
                \n• If the width is ${numericCurrentWidth} ${currentWidthUnit}, the height must be higher than ${minHeight} ${currentWidthUnit}
                \n• If the height is ${numericCurrentHeight} ${currentHeightUnit}, the width must be lower than ${maxWidth} ${currentHeightUnit}`,
                {
                    maxHorizontal: maxHorizontal.toString(),
                    maxVertical: maxVertical.toString(),
                    currentWidth: numericCurrentWidth.toString(),
                    currentHeight: numericCurrentHeight.toString(),
                    minHeight: minHeight.toString(),
                    maxWidth: maxWidth.toString(),
                    currentWidthUnit: currentWidthUnit || '',
                    currentHeightUnit: currentHeightUnit || '',
                },
            );
        }
        return null;
    }, [layout, currentWidth, currentHeight, unit, getUITranslation]);

    return (
        <Tooltip
            content={uiTranslation}
            position={TooltipPosition.TOP}
            anchorId={APP_WRAPPER_ID}
            infoStyle={{
                width: '15rem',
                whiteSpace: 'pre-line',
            }}
        >
            <ErrorMessageContainer>
                <Icon icon={AvailableIcons.faCircleExclamation} />
                <ErrorMessage>
                    {getUITranslation(
                        ['formBuilder', 'layouts', 'errorRangeConstraintMessage'],
                        'Only specific aspect ratios are supported.',
                    )}
                </ErrorMessage>
            </ErrorMessageContainer>
        </Tooltip>
    );
}

export default RangeConstraintErrorMessage;

import { AvailableIcons, Icon, Tooltip, TooltipPosition } from '@chili-publish/grafx-shared-components';
import { APP_WRAPPER_ID } from 'src/utils/constants';
import { useUITranslations } from 'src/core/hooks/useUITranslations';
import { useMemo } from 'react';
import { LayoutPropertiesType, MeasurementUnit } from '@chili-publish/studio-sdk';
import { formatNumber } from 'src/utils/formatNumber';
import { ErrorMessage } from '../shared/ErrorMessage.styles';
import { ErrorMessageContainer } from './Layout.styles';
import { roundValue } from './util';

interface RangeConstraintErrorMessageProps {
    currentWidth: string;
    currentHeight: string;
    unit: MeasurementUnit | undefined;
    layout: LayoutPropertiesType;
}
function RangeConstraintErrorMessage({ currentWidth, currentHeight, unit, layout }: RangeConstraintErrorMessageProps) {
    const { getUITranslation } = useUITranslations();

    const uiTranslation = useMemo(() => {
        if (!layout?.resizableByUser.minAspect || !layout?.resizableByUser.maxAspect) {
            return null;
        }

        const numericCurrentWidth = Number(formatNumber(currentWidth, unit));
        const numericCurrentHeight = Number(formatNumber(currentHeight, unit));

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
                \n• If the width is ${numericCurrentWidth} ${unit}, the height must be between ${minHeight} ${unit} and ${maxHeight} ${unit}
                \n• If the height is ${numericCurrentHeight} ${unit}, the width must be between ${minWidth} ${unit} and ${maxWidth} ${unit}`,
            {
                minHorizontal: minHorizontal.toString(),
                minVertical: minVertical.toString(),
                maxHorizontal: maxHorizontal.toString(),
                maxVertical: maxVertical.toString(),
                currentWidth: numericCurrentWidth.toString(),
                currentHeight: numericCurrentHeight.toString(),
                unit: unit || '',
            },
        );
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

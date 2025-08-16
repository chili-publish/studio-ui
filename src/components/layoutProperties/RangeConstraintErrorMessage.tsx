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
    unit: MeasurementUnit;
    layout: LayoutPropertiesType;
}
function RangeConstraintErrorMessage({ currentWidth, currentHeight, unit, layout }: RangeConstraintErrorMessageProps) {
    const { getUITranslation } = useUITranslations();

    const uiTranslation = useMemo(() => {
        const numericCurrentWidth = Number(formatNumber(currentWidth, unit));
        const numericCurrentHeight = Number(formatNumber(currentHeight, unit));

        if (layout?.resizableByUser.minAspect && layout?.resizableByUser.maxAspect) {
            const minAspectHorizontal = layout.resizableByUser.minAspect.horizontal;
            const minAspectVertical = layout.resizableByUser.minAspect.vertical;
            const maxAspectHorizontal = layout.resizableByUser.maxAspect.horizontal;
            const maxAspectVertical = layout.resizableByUser.maxAspect.vertical;

            const heightRange = [
                roundValue((numericCurrentWidth / minAspectHorizontal) * minAspectVertical),
                roundValue((numericCurrentWidth / maxAspectHorizontal) * maxAspectVertical),
            ];
            const widthRange = [
                roundValue((numericCurrentHeight / minAspectVertical) * minAspectHorizontal),
                roundValue((numericCurrentHeight / maxAspectVertical) * maxAspectHorizontal),
            ];
            return getUITranslation(
                ['formBuilder', 'layouts', 'errorRangeConstraintTooltip'],
                `To respect the allowed proportions (${minAspectHorizontal}:${minAspectVertical} to ${maxAspectHorizontal}:${maxAspectVertical}):
                \n\r• If the width is ${numericCurrentWidth} ${unit}, the height must be between ${heightRange[0]} ${unit} and ${heightRange[1]} ${unit}
                \n• If the height is ${numericCurrentHeight} ${unit}, the width must be between ${widthRange[0]} ${unit} and ${widthRange[1]} ${unit}`,
            );
        }

        if (layout?.resizableByUser.minAspect) {
            const minAspectHorizontal = layout.resizableByUser.minAspect.horizontal;
            const minAspectVertical = layout.resizableByUser.minAspect.vertical;

            const maxHeight = roundValue((numericCurrentWidth / minAspectHorizontal) * minAspectVertical);
            const minWidth = roundValue((numericCurrentHeight / minAspectVertical) * minAspectHorizontal);

            return getUITranslation(
                ['formBuilder', 'layouts', 'errorMinRangeConstraintTooltip'],
                `To respect the allowed proportions (min ${minAspectHorizontal}:${minAspectVertical}):
                \n• If the width is ${numericCurrentWidth} ${unit}, the height must be lower than ${maxHeight} ${unit}
                \n• If the height is ${numericCurrentHeight} ${unit}, the width must be higher than ${minWidth} ${unit}`,
            );
        }

        if (layout?.resizableByUser.maxAspect) {
            const maxAspectHorizontal = layout.resizableByUser.maxAspect.horizontal;
            const maxAspectVertical = layout.resizableByUser.maxAspect.vertical;

            const minHeight = roundValue((numericCurrentWidth / maxAspectHorizontal) * maxAspectVertical);
            const maxWidth = roundValue((numericCurrentHeight / maxAspectVertical) * maxAspectHorizontal);

            return getUITranslation(
                ['formBuilder', 'layouts', 'errorMaxRangeConstraintTooltip'],
                `To respect the allowed proportions (max ${maxAspectHorizontal}:${maxAspectVertical}):
                \n• If the width is ${numericCurrentWidth} ${unit}, the height must be higher than ${minHeight} ${unit}
                \n• If the height is ${numericCurrentHeight} ${unit}, the width must be lower than ${maxWidth} ${unit}`,
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

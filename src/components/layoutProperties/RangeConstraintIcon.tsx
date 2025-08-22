import { AvailableIcons, Icon, Tooltip, TooltipPosition } from '@chili-publish/grafx-shared-components';
import { ConstraintMode, LayoutPropertiesType } from '@chili-publish/studio-sdk';
import { useMemo } from 'react';
import { APP_WRAPPER_ID } from '../../utils/constants';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { useUITranslations } from '../../core/hooks/useUITranslations';

interface RangeConstraintIconProps {
    layout: LayoutPropertiesType;
}
function RangeConstraintIcon({ layout }: RangeConstraintIconProps) {
    const { getUITranslation } = useUITranslations();

    const uiTranslation = useMemo(() => {
        if (layout?.resizableByUser.aspectRange && layout?.resizableByUser.constraintMode === ConstraintMode.range) {
            const minHorizontal = layout.resizableByUser.aspectRange.min.horizontal.toString();
            const minVertical = layout.resizableByUser.aspectRange.min.vertical.toString();
            const maxHorizontal = layout.resizableByUser.aspectRange.max.horizontal.toString();
            const maxVertical = layout.resizableByUser.aspectRange.max.vertical.toString();

            return getUITranslation(
                ['formBuilder', 'layouts', 'rangeConstraintTooltip'],
                `Proportions are limited — only aspect ratios between ${minHorizontal}:${minVertical} and ${maxHorizontal}:${maxVertical} are allowed.`,
                {
                    minHorizontal,
                    minVertical,
                    maxHorizontal,
                    maxVertical,
                },
            );
        }
        return null;
    }, [layout, getUITranslation]);

    if (!layout) {
        return null;
    }
    return (
        <Tooltip
            content={uiTranslation}
            position={TooltipPosition.TOP}
            anchorId={APP_WRAPPER_ID}
            infoStyle={{
                width: '10rem',
            }}
        >
            <Icon
                icon={AvailableIcons.faLink}
                dataId={getDataIdForSUI(`layout-constraint-icon-${layout.resizableByUser.constraintMode}`)}
                dataTestId={getDataTestIdForSUI(`layout-constraint-icon-${layout.resizableByUser.constraintMode}`)}
            />
        </Tooltip>
    );
}

export default RangeConstraintIcon;

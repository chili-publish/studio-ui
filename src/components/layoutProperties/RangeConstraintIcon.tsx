import { AvailableIcons, Icon, Tooltip, TooltipPosition } from '@chili-publish/grafx-shared-components';
import { LayoutPropertiesType } from '@chili-publish/studio-sdk';
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
        if (layout?.resizableByUser.minAspect && layout?.resizableByUser.maxAspect) {
            return getUITranslation(
                ['formBuilder', 'layouts', 'rangeConstraintTooltip'],
                `Proportions are limited — only aspect ratios between ${layout.resizableByUser.minAspect?.horizontal}:${layout.resizableByUser.minAspect?.vertical} and ${layout.resizableByUser.maxAspect?.horizontal}:${layout.resizableByUser.maxAspect?.vertical} are allowed.`,
            );
        }

        if (layout?.resizableByUser.minAspect) {
            return getUITranslation(
                ['formBuilder', 'layouts', 'minRangeConstraintTooltip'],
                `Proportions are limited — only aspect ratios greater than ${layout.resizableByUser.minAspect?.horizontal}:${layout.resizableByUser.minAspect?.vertical} are allowed.`,
            );
        }

        if (layout?.resizableByUser.maxAspect) {
            return getUITranslation(
                ['formBuilder', 'layouts', 'maxRangeConstraintTooltip'],
                `Proportions are limited — only aspect ratios lower than ${layout.resizableByUser.maxAspect?.horizontal}:${layout.resizableByUser.maxAspect?.vertical} are allowed.`,
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

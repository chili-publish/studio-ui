import { AvailableIcons, Icon, Tooltip, TooltipPosition } from '@chili-publish/grafx-shared-components';
import { LayoutPropertiesType } from '@chili-publish/studio-sdk';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import { APP_WRAPPER_ID } from '../../utils/constants';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';

interface LockedConstraintIconProps {
    layout: LayoutPropertiesType;
}
const LockedConstraintIcon = ({ layout }: LockedConstraintIconProps) => {
    const { getUITranslation } = useUITranslations();

    if (!layout) {
        return null;
    }

    return (
        <Tooltip
            content={getUITranslation(['formBuilder', 'layouts', 'lockConstraintTooltip'], 'Proportions are locked')}
            position={TooltipPosition.TOP}
            anchorId={APP_WRAPPER_ID}
        >
            <Icon
                icon={AvailableIcons.faLock}
                dataId={getDataIdForSUI(`layout-constraint-icon-${layout.resizableByUser.constraintMode}`)}
                dataTestId={getDataTestIdForSUI(`layout-constraint-icon-${layout.resizableByUser.constraintMode}`)}
            />
        </Tooltip>
    );
};

export default LockedConstraintIcon;

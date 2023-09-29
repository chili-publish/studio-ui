import { Button, ButtonVariant, Icon } from '@chili-publish/grafx-shared-components';
import { NavbarButtonProps } from './NavbarButton.types';
import { getDataIdForSUI } from '../../utils/dataIds';

function NavbarButton(props: NavbarButtonProps) {
    const {
        dataId,
        label,
        ariaLabel,
        icon,
        disabled,
        flipIconY = false,
        variant = ButtonVariant.tertiary,
        handleOnClick,
    } = props;
    return (
        <Button
            dataId={getDataIdForSUI(dataId)}
            variant={variant}
            onClick={handleOnClick}
            icon={<Icon key={`icon-${ariaLabel}`} icon={icon} transform={{ flipY: flipIconY }} />}
            disabled={disabled}
            label={label}
        />
    );
}

export default NavbarButton;

import { Button, ButtonTypes, FontSizes, Icon } from '@chili-publish/grafx-shared-components';
import { NavbarButtonProps } from './NavbarButton.types';

function NavbarButton(props: NavbarButtonProps) {
    const { label, ariaLabel, icon, disabled, flipIconY = false, buttonType = ButtonTypes.tertiary, noPadding } = props;

    const handleOnClick = () => {
        // eslint-disable-next-line no-console
        console.log(`[${NavbarButton.name}] Clicked`);
    };

    return (
        <Button
            type="button"
            buttonType={buttonType}
            onClick={() => handleOnClick()}
            icon={<Icon key={`icon-${ariaLabel}`} icon={icon} transform={{ flipY: flipIconY }} />}
            disabled={disabled}
            label={label}
            style={{ padding: noPadding ? '0px' : undefined, fontSize: FontSizes.button as string }}
        />
    );
}

export default NavbarButton;

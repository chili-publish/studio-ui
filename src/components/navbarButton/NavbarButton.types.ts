import { AvailableIconsType, ButtonTypes } from '@chili-publish/grafx-shared-components';
import { ReactElement } from 'react';

export type NavbarButtonProps = {
    ariaLabel: string;
    label?: string | ReactElement;
    icon: AvailableIconsType;
    disabled?: boolean;
    flipIconY?: boolean;
    buttonType?: ButtonTypes;
};

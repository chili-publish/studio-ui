import { AvailableIconsType, ButtonTypes } from '@chili-publish/grafx-shared-components';
import { ReactElement } from 'react';

export type NavbarButtonProps = {
    key?: string | number;
    ariaLabel: string;
    label?: string | ReactElement;
    icon: AvailableIconsType;
    disabled?: boolean;
    flipIconY?: boolean;
    buttonType?: ButtonTypes;
    noPadding?: boolean;
};

import { AvailableIconsType, ButtonTypes } from '@chili-publish/grafx-shared-components';
import { ReactElement } from 'react';

export type NavbarButtonProps = {
    handleOnClick: () => void;
    ariaLabel: string;
    icon: AvailableIconsType;
    key?: string | number;
    label?: string | ReactElement;
    disabled?: boolean;
    flipIconY?: boolean;
    buttonType?: ButtonTypes;
    noPadding?: boolean;
};

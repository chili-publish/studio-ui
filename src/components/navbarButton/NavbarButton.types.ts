import { AvailableIconsType, ButtonVariant } from '@chili-publish/grafx-shared-components';
import { ReactElement } from 'react';

export type NavbarButtonProps = {
    dataId: string;
    dataTestId?: string;
    handleOnClick: () => void;
    ariaLabel: string;
    icon: AvailableIconsType;
    key?: string | number;
    label?: string | ReactElement;
    disabled?: boolean;
    flipIconY?: boolean;
    variant?: ButtonVariant;
};

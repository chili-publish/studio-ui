import { ReactElement, ReactNode } from 'react';

export interface INavbar {
    projectName?: string;
    goBack?: () => void;
}
export interface NavbarItemType {
    label: string;
    content: string | ReactElement | ReactNode;
    hideOnMobile?: boolean;
}

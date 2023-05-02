import { ReactElement, ReactNode } from 'react';

export interface NavbarItemType {
    label: string;
    content: string | ReactElement | ReactNode;
    hideOnMobile?: boolean;
}

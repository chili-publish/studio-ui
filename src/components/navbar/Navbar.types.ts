import { ReactElement, ReactNode } from 'react';

export interface INavbar {
    undoStackState: { canRedo: boolean; canUndo: boolean };
    projectName?: string;
    goBack?: () => void;
}
export interface NavbarItemType {
    label: string;
    content: string | ReactElement | ReactNode;
    hideOnMobile?: boolean;
}

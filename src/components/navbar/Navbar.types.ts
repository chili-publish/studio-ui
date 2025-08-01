import { ReactElement, ReactNode } from 'react';
import { CSSProp } from 'styled-components';

export interface INavbar {
    projectName: string;
    goBack?: () => void;
    zoom: number;
    undoStackState: { canRedo: boolean; canUndo: boolean };
    selectedLayoutId: string | null;
}
export interface NavbarItemType {
    label: string;
    content: string | ReactElement | ReactNode;
    hideOnMobile?: boolean;
    styles?: CSSProp;
}

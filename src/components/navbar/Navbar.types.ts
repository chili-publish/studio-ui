import { ReactElement, ReactNode } from 'react';
import { CSSProp } from 'styled-components';
import { ProjectConfig } from '../../types/types';

export interface INavbar {
    projectName?: string;
    goBack?: () => void;
    zoom: number;
    undoStackState: { canRedo: boolean; canUndo: boolean };
    projectConfig: ProjectConfig;
}
export interface NavbarItemType {
    label: string;
    content: string | ReactElement | ReactNode;
    hideOnMobile?: boolean;
    styles?: CSSProp;
}

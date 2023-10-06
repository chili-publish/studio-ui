import { ReactElement, ReactNode } from 'react';
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
}

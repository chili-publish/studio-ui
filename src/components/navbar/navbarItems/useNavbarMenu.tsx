import {
    AvailableIcons,
    ContextMenu,
    ContextMenuItem,
    GraFxIcon,
    Label,
    useTheme,
} from '@chili-publish/grafx-shared-components';
import { useMemo, useState } from 'react';
import { css } from 'styled-components';
import { APP_WRAPPER_ID } from '../../../utils/constants';
import { MenuOption } from '../Navbar.styles';
import { getShortcut } from './shortcuts';
import useUndoRedo from './useUndoRedo';
import useZoom from './useZoom';

interface NavbarMenuProps {
    zoom: number;
    undoStackState: { canRedo: boolean; canUndo: boolean };
    onBackClick: (() => void) | undefined;
}

const useNavbarMenu = ({ zoom, undoStackState, onBackClick }: NavbarMenuProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { handleUndo, handleRedo } = useUndoRedo(undoStackState);
    const { zoomIn, zoomOut } = useZoom(zoom);
    const { panel } = useTheme();

    const fileMenuOptions: ContextMenuItem = {
        label: { key: 'file', value: 'File' },
        hasSeparator: true,
        children: [
            {
                label: (
                    <MenuOption>
                        <Label value="Save" translationKey="save" />
                        <div>{getShortcut('save')}</div>
                    </MenuOption>
                ),
                isDisabled: true,
                onClick: () => null,
            },
            {
                label: (
                    <MenuOption>
                        <Label value="Save as" translationKey="save" />
                        <div>{getShortcut('saveAs')}</div>
                    </MenuOption>
                ),
                isDisabled: true,
                onClick: () => null,
            },
            {
                label: <Label value="Rename" translationKey="rename" />,
                isDisabled: true,
                onClick: () => null,
            },
        ],
    };

    const editMenuOptions: ContextMenuItem = {
        label: <Label value="Edit" translationKey="edit" />,
        children: [
            {
                label: (
                    <MenuOption>
                        <Label value="Undo" translationKey="undo" />
                        <div>{getShortcut('undo')}</div>
                    </MenuOption>
                ),
                isDisabled: !undoStackState.canUndo,
                onClick: handleUndo,
            },
            {
                label: (
                    <MenuOption>
                        <Label value="Redo" translationKey="redo" />
                        <div>{getShortcut('redo')}</div>
                    </MenuOption>
                ),
                isDisabled: !undoStackState.canRedo,
                onClick: handleRedo,
            },
            {
                label: (
                    <MenuOption>
                        <Label value="Cut" translationKey="cut" />
                        <div>{getShortcut('cut')}</div>
                    </MenuOption>
                ),
                isDisabled: true,
                hasSeparator: true,
                onClick: () => null,
            },
            {
                label: (
                    <MenuOption>
                        <Label value="Copy" translationKey="copy" />
                        <div>{getShortcut('copy')}</div>
                    </MenuOption>
                ),
                isDisabled: true,
                onClick: () => null,
            },
            {
                label: (
                    <MenuOption>
                        <Label value="Paste" translationKey="paste" />
                        <div>{getShortcut('paste')}</div>
                    </MenuOption>
                ),
                isDisabled: true,
                onClick: () => null,
            },
            {
                label: (
                    <MenuOption>
                        <Label value="Duplicate" translationKey="duplicate" />
                        <div>{getShortcut('duplicate')}</div>
                    </MenuOption>
                ),
                isDisabled: true,
                onClick: () => null,
            },
            {
                label: (
                    <MenuOption>
                        <Label value="Delete" translationKey="delete" />
                        <div>⌫</div>
                    </MenuOption>
                ),
                isDisabled: true,
                onClick: () => null,
            },
        ],
    };

    const frameMenuOptions: ContextMenuItem = {
        label: <Label value="Frames" translationKey="frames" />,
        children: [
            {
                label: <Label value="Bring to front" translationKey="bringToFront" />,
                isDisabled: true,
                onClick: () => null,
            },
            {
                label: <Label value="Bring forward" translationKey="bringForward" />,
                isDisabled: true,
                onClick: () => null,
            },
            {
                label: <Label value="Send backward" translationKey="sendBackward" />,
                isDisabled: true,
                onClick: () => null,
            },
            {
                label: <Label value="Send to back" translationKey="sendToBack" />,
                isDisabled: true,
                onClick: () => null,
            },
        ],
    };

    const viewMenuOptions: ContextMenuItem = {
        label: <Label value="View" translationKey="view" />,
        children: [
            {
                label: (
                    <MenuOption>
                        <Label value="Preview mode" translationKey="previewMode" />
                        <div>W</div>
                    </MenuOption>
                ),
                isDisabled: true,
                onClick: () => null,
            },
            {
                label: (
                    <MenuOption>
                        <Label value="Zoom in" translationKey="zoomIn" />
                        <div>{getShortcut('zoomIn')}</div>
                    </MenuOption>
                ),
                hasSeparator: true,
                onClick: zoomIn,
            },
            {
                label: (
                    <MenuOption>
                        <Label value="Zoom out" translationKey="zoomOut" />
                        <div>{getShortcut('zoomOut')}</div>
                    </MenuOption>
                ),
                onClick: zoomOut,
            },
            {
                label: (
                    <MenuOption>
                        <Label value="Zoom to page" translationKey="zoomToPage" />
                        <div>{getShortcut('zoomToPage')}</div>
                    </MenuOption>
                ),
                onClick: () => null,
            },
            {
                label: (
                    <MenuOption>
                        <Label value="Zoom to 100%" translationKey="zoomTo100" />
                        <div>{getShortcut('zoomTo100')}</div>
                    </MenuOption>
                ),
                onClick: () => null,
            },
        ],
    };

    const menuItems = useMemo(
        () => [
            {
                label: { key: 'backToTemplates', value: 'Back to templates' },
                onClick: onBackClick,
            },
            fileMenuOptions,
            editMenuOptions,
            frameMenuOptions,
            viewMenuOptions,
            {
                label: (
                    <MenuOption>
                        <Label value="Export" translationKey="export" />
                        <div>{getShortcut('export')}</div>
                    </MenuOption>
                ),
                onClick: () => null,
                hasSeparator: true,
            },
        ],
        [onBackClick, fileMenuOptions, editMenuOptions, frameMenuOptions, viewMenuOptions],
    );

    const openMenu = () => {
        setIsMenuOpen(true);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };
    const navbarItem = useMemo(
        () => ({
            label: 'Menu',
            content: (
                <span
                    id="menu-toggle"
                    role="button"
                    tabIndex={-1}
                    onClick={isMenuOpen ? closeMenu : openMenu}
                    onKeyDown={isMenuOpen ? closeMenu : openMenu}
                >
                    <GraFxIcon icon={AvailableIcons.faBars} />
                    <ContextMenu
                        isVisible={isMenuOpen}
                        isDismissible
                        darkTheme
                        editorComponent
                        onClose={closeMenu}
                        menuItems={menuItems}
                        position={{ top: 40, left: 8 } as unknown as DOMRect}
                        ignoreOnClickParentId="menu-toggle"
                        anchorId={APP_WRAPPER_ID}
                    />
                </span>
            ),
            hideOnMobile: true,
            styles: css`
                display: flex;
                align-items: center;
                margin: auto 0;
                padding: 0 0.5rem;
                position: relative;
                height: 100%;
                border-right: 2px solid ${panel.borderColor};
            `,
        }),
        [isMenuOpen, menuItems, panel.borderColor],
    );

    return {
        menuNavbarItem: navbarItem,
    };
};

export default useNavbarMenu;

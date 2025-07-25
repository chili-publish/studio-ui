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
import { useUITranslations } from 'src/core/hooks/useUITranslations';
import { APP_WRAPPER_ID } from '../../../utils/constants';
import { MenuOption } from '../Navbar.styles';
import { getShortcut } from '../../../contexts/ShortcutManager/shortcuts';
import useUndoRedo from '../../../contexts/ShortcutManager/useUndoRedo';
import useZoom from '../../../contexts/ShortcutManager/useZoom';

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
    const { getUITranslation } = useUITranslations();

    const fileMenuOptions: ContextMenuItem = useMemo(
        () => ({
            label: {
                key: 'file',
                value: getUITranslation(['toolBar', 'hamburgerMenu', 'fileMenuItem', 'label'], 'File'),
            },
            hasSeparator: true,
            children: [
                {
                    label: (
                        <MenuOption>
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'fileMenuItem', 'options', 'saveItemLabel'],
                                    'Save',
                                )}
                                translationKey="save"
                            />
                            <div>{getShortcut('save')}</div>
                        </MenuOption>
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
                {
                    label: (
                        <MenuOption>
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'fileMenuItem', 'options', 'saveAsItemLabel'],
                                    'Save as',
                                )}
                                translationKey="save"
                            />
                            <div>{getShortcut('saveAs')}</div>
                        </MenuOption>
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
                {
                    label: (
                        <Label
                            value={getUITranslation(
                                ['toolBar', 'hamburgerMenu', 'fileMenuItem', 'options', 'renameItemLabel'],
                                'Rename',
                            )}
                            translationKey="rename"
                        />
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
            ],
        }),
        [getUITranslation],
    );

    const editMenuOptions: ContextMenuItem = useMemo(
        () => ({
            label: (
                <Label
                    value={getUITranslation(['toolBar', 'hamburgerMenu', 'editMenuItem', 'label'], 'Edit')}
                    translationKey="edit"
                />
            ),
            children: [
                {
                    label: (
                        <MenuOption>
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'editMenuItem', 'options', 'undoItemLabel'],
                                    'Undo',
                                )}
                                translationKey="undo"
                            />
                            <div>{getShortcut('undo')}</div>
                        </MenuOption>
                    ),
                    isDisabled: !undoStackState.canUndo,
                    onClick: () => {
                        handleUndo();
                        closeMenu();
                    },
                },
                {
                    label: (
                        <MenuOption>
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'editMenuItem', 'options', 'redoItemLabel'],
                                    'Redo',
                                )}
                                translationKey="redo"
                            />
                            <div>{getShortcut('redo')}</div>
                        </MenuOption>
                    ),
                    isDisabled: !undoStackState.canRedo,
                    onClick: () => {
                        handleRedo();
                        closeMenu();
                    },
                },
                {
                    label: (
                        <MenuOption>
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'editMenuItem', 'options', 'cutItemLabel'],
                                    'Cut',
                                )}
                                translationKey="cut"
                            />
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
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'editMenuItem', 'options', 'copyItemLabel'],
                                    'Copy',
                                )}
                                translationKey="copy"
                            />
                            <div>{getShortcut('copy')}</div>
                        </MenuOption>
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
                {
                    label: (
                        <MenuOption>
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'editMenuItem', 'options', 'pasteItemLabel'],
                                    'Paste',
                                )}
                                translationKey="paste"
                            />
                            <div>{getShortcut('paste')}</div>
                        </MenuOption>
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
                {
                    label: (
                        <MenuOption>
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'editMenuItem', 'options', 'duplicateItemLabel'],
                                    'Duplicate',
                                )}
                                translationKey="duplicate"
                            />
                            <div>{getShortcut('duplicate')}</div>
                        </MenuOption>
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
                {
                    label: (
                        <MenuOption>
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'editMenuItem', 'options', 'deleteItemLabel'],
                                    'Delete',
                                )}
                                translationKey="delete"
                            />
                            <div>⌫</div>
                        </MenuOption>
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
            ],
        }),
        [handleUndo, handleRedo, undoStackState, getUITranslation],
    );

    const frameMenuOptions: ContextMenuItem = useMemo(
        () => ({
            label: (
                <Label
                    value={getUITranslation(['toolBar', 'hamburgerMenu', 'framesMenuItem', 'label'], 'Frames')}
                    translationKey="frames"
                />
            ),
            children: [
                {
                    label: (
                        <Label
                            value={getUITranslation(
                                ['toolBar', 'hamburgerMenu', 'framesMenuItem', 'options', 'bringToFrontItemLabel'],
                                'Bring to front',
                            )}
                            translationKey="bringToFront"
                        />
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
                {
                    label: (
                        <Label
                            value={getUITranslation(
                                ['toolBar', 'hamburgerMenu', 'framesMenuItem', 'options', 'bringForwardItemLabel'],
                                'Bring forward',
                            )}
                            translationKey="bringForward"
                        />
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
                {
                    label: (
                        <Label
                            value={getUITranslation(
                                ['toolBar', 'hamburgerMenu', 'framesMenuItem', 'options', 'sendBackwardItemLabel'],
                                'Send backward',
                            )}
                            translationKey="sendBackward"
                        />
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
                {
                    label: (
                        <Label
                            value={getUITranslation(
                                ['toolBar', 'hamburgerMenu', 'framesMenuItem', 'options', 'sendToBackItemLabel'],
                                'Send to back',
                            )}
                            translationKey="sendToBack"
                        />
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
            ],
        }),
        [getUITranslation],
    );

    const viewMenuOptions: ContextMenuItem = useMemo(
        () => ({
            label: (
                <Label
                    value={getUITranslation(['toolBar', 'hamburgerMenu', 'viewMenuItem', 'label'], 'View')}
                    translationKey="view"
                />
            ),
            children: [
                {
                    label: (
                        <MenuOption>
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'viewMenuItem', 'options', 'previewModeItemLabel'],
                                    'Preview mode',
                                )}
                                translationKey="previewMode"
                            />
                            <div>W</div>
                        </MenuOption>
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
                {
                    label: (
                        <MenuOption>
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'viewMenuItem', 'options', 'zoomInItemLabel'],
                                    'Zoom in',
                                )}
                                translationKey="zoomIn"
                            />
                            <div>{getShortcut('zoomIn')}</div>
                        </MenuOption>
                    ),
                    hasSeparator: true,
                    onClick: zoomIn,
                },
                {
                    label: (
                        <MenuOption>
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'viewMenuItem', 'options', 'zoomOutItemLabel'],
                                    'Zoom out',
                                )}
                                translationKey="zoomOut"
                            />
                            <div>{getShortcut('zoomOut')}</div>
                        </MenuOption>
                    ),
                    onClick: zoomOut,
                },
                {
                    label: (
                        <MenuOption>
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'viewMenuItem', 'options', 'zoomToPageItemLabel'],
                                    'Zoom to page',
                                )}
                                translationKey="zoomToPage"
                            />
                            <div>{getShortcut('zoomToPage')}</div>
                        </MenuOption>
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
                {
                    label: (
                        <MenuOption>
                            <Label
                                value={getUITranslation(
                                    ['toolBar', 'hamburgerMenu', 'viewMenuItem', 'options', 'zoomTo100ItemLabel'],
                                    'Zoom to 100%',
                                )}
                                translationKey="zoomTo100"
                            />
                            <div>{getShortcut('zoomTo100')}</div>
                        </MenuOption>
                    ),
                    isDisabled: true,
                    onClick: () => null,
                },
            ],
        }),
        [zoomIn, zoomOut, getUITranslation],
    );

    const menuItems = useMemo(
        () => [
            {
                label: {
                    key: 'backToTemplates',
                    value: getUITranslation(
                        ['toolBar', 'hamburgerMenu', 'backToTemplatesItemLabel'],
                        'Back to templates',
                    ),
                },
                onClick: onBackClick,
            },
            fileMenuOptions,
            editMenuOptions,
            frameMenuOptions,
            viewMenuOptions,
        ],
        [onBackClick, fileMenuOptions, editMenuOptions, frameMenuOptions, viewMenuOptions, getUITranslation],
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

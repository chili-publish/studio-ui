import { AvailableIcons, ContextMenu, GraFxIcon, useTheme } from '@chili-publish/grafx-shared-components';
import { useMemo, useState } from 'react';
import { css } from 'styled-components';
import { APP_WRAPPER_ID } from '../../../utils/constants';

const useNavbarMenu = (onBackClick: (() => void) | undefined) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { panel } = useTheme();

    const menuItems = useMemo(
        () => [
            {
                label: { key: 'backToTemplates', value: 'Back to templates' },
                onClick: onBackClick,
            },
        ],
        [onBackClick],
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

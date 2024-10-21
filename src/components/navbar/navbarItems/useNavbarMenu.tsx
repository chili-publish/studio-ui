import { AvailableIcons, ContextMenu, GraFxIcon } from '@chili-publish/grafx-shared-components';
import { useMemo, useState } from 'react';
import { css } from 'styled-components';

const useNavbarMenu = (onBackClick: (() => void) | undefined) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                    />
                </span>
            ),
            hideOnMobile: true,
            styles: css`
                margin: auto 0;
                padding: 0 0.5rem 0 0;
                position: relative;
                ::after {
                    display: block;
                    content: '';
                    width: 0.125rem;
                    height: 3rem;
                    background-color: #2f2f2f;
                    position: absolute;
                    right: 0;
                    top: -7px;
                }
            `,
        }),
        [isMenuOpen, menuItems],
    );

    return {
        menuNavbarItem: navbarItem,
    };
};

export default useNavbarMenu;

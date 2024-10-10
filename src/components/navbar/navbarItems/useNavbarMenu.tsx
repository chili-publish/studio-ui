import { AvailableIcons, ContextMenu, GraFxIcon } from '@chili-publish/grafx-shared-components';
import { useMemo, useState } from 'react';

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
    const navbarItem = useMemo(
        () => ({
            label: 'Menu',
            content: (
                <span>
                    <GraFxIcon icon={AvailableIcons.faBars} onClick={() => setIsMenuOpen(true)} />
                    <ContextMenu
                        isDismissible
                        darkTheme
                        editorComponent
                        onClose={() => setIsMenuOpen(false)}
                        isVisible={isMenuOpen}
                        menuItems={menuItems}
                        position={{ top: 40, left: 8 } as unknown as DOMRect}
                    />
                </span>
            ),
            hideOnMobile: true,
        }),
        [isMenuOpen, menuItems],
    );

    return {
        menuNavbarItem: navbarItem,
    };
};

export default useNavbarMenu;

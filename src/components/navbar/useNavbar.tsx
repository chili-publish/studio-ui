import { useMemo } from 'react';
import { NavbarItemType } from './Navbar.types';
import useNavbarUndoRedoItems from './navbarItems/useNavbarUndoRedo';
import useNavbarZoom from './navbarItems/useNavbarZoom';
import useNavbarDownloadBtn from './navbarItems/useNavbarDownloadBtn';
import useNavbarBackBtn from './navbarItems/useNavbarBackBtn';
import { useUiConfigContext } from '../../contexts/UiConfigContext';

interface INavbar {
    projectName: string | undefined;
    zoom: number;
    undoStackState: { canRedo: boolean; canUndo: boolean };
    onBackClick: (() => void) | undefined;
    onDownloadPanelOpen: () => void;
}
const useNavbar = ({ projectName, zoom, undoStackState, onBackClick, onDownloadPanelOpen }: INavbar) => {
    const { isBackBtnVisible } = useUiConfigContext();
    const { backBtnItem } = useNavbarBackBtn(projectName, onBackClick);
    const { downloadNavbarItem } = useNavbarDownloadBtn(onDownloadPanelOpen);
    const { undoRedoNavbarItem } = useNavbarUndoRedoItems(undoStackState);
    const { zoomNavbarItem } = useNavbarZoom(zoom);

    const navbarItems = useMemo((): NavbarItemType[] => {
        const items = [backBtnItem, undoRedoNavbarItem, downloadNavbarItem, zoomNavbarItem];

        // Filter out null items (hidden elements)
        const visibleItems = items.filter((item) => !!item);

        // Only add a spacer when the back button is hidden
        // This is because the back button has marginInlineEnd: 'auto' which pushes other elements to the right
        // When it's hidden, we need to maintain that spacing
        if (!isBackBtnVisible) {
            const spacerItem = {
                label: 'spacer',
                content: <div />,
                styles: { marginInlineEnd: 'auto' },
            };
            visibleItems.unshift(spacerItem);
        }

        return visibleItems as NavbarItemType[];
    }, [backBtnItem, undoRedoNavbarItem, downloadNavbarItem, zoomNavbarItem, isBackBtnVisible]);

    return {
        navbarItems,
    };
};

export default useNavbar;

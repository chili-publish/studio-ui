import { useMemo } from 'react';
import { NavbarItemType } from './Navbar.types';
import useNavbarUndoRedoItems from './navbarItems/useNavbarUndoRedo';
import useNavbarZoom from './navbarItems/useNavbarZoom';
import useNavbarDownloadBtn from './navbarItems/useNavbarDownloadBtn';
import useNavbarBackBtn from './navbarItems/useNavbarBackBtn';

interface INavbar {
    projectName: string | undefined;
    zoom: number;
    undoStackState: { canRedo: boolean; canUndo: boolean };
    onBackClick: (() => void) | undefined;
    onDownloadPanelOpen: () => void;
}
const useNavbar = ({ projectName, zoom, undoStackState, onBackClick, onDownloadPanelOpen }: INavbar) => {
    const { backBtnItem } = useNavbarBackBtn(projectName, onBackClick);
    const { downloadNavbarItem } = useNavbarDownloadBtn(onDownloadPanelOpen);
    const { undoRedoNavbarItem } = useNavbarUndoRedoItems(undoStackState);
    const { zoomNavbarItem } = useNavbarZoom(zoom);

    const navbarItems = useMemo((): NavbarItemType[] => {
        const items = [backBtnItem, undoRedoNavbarItem, downloadNavbarItem, zoomNavbarItem];
        return items.filter((item) => !!item);
    }, [backBtnItem, undoRedoNavbarItem, downloadNavbarItem, zoomNavbarItem]);

    return {
        navbarItems,
    };
};

export default useNavbar;

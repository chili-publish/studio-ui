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
    const { backBtnItems } = useNavbarBackBtn(projectName, onBackClick);
    const { downloadNavbarItems } = useNavbarDownloadBtn(onDownloadPanelOpen);
    const { undoRedoNavbarItems } = useNavbarUndoRedoItems(undoStackState);
    const { zoomNavbarItems } = useNavbarZoom(zoom);

    const navbarItems = useMemo((): NavbarItemType[] => {
        return [...backBtnItems, ...undoRedoNavbarItems, ...downloadNavbarItems, ...zoomNavbarItems];
    }, [backBtnItems, undoRedoNavbarItems, downloadNavbarItems, zoomNavbarItems]);

    return {
        navbarItems,
    };
};

export default useNavbar;

import { useMemo } from 'react';
import useNavbarDownloadBtn from '../navbarItems/useNavbarDownloadBtn';
import useNavbarUndoRedoItems from '../navbarItems/useNavbarUndoRedo';
import useNavbarZoom from '../navbarItems/useNavbarZoom';
import { NavbarItemType } from '../Navbar.types';
import { NavbarGroup, NavbarLabel } from '../Navbar.styles';
import useNavbarMenu from '../navbarItems/useNavbarMenu';
import useNavbarModeToggle from '../navbarItems/useNavbarModeToggle';
import useUserInterfaceSelector from '../navbarItems/useUserInterfaceSelector';
import { ProjectConfig } from '../../../types/types';

interface INavbar {
    projectName: string | undefined;
    projectConfig: ProjectConfig;
    zoom: number;
    undoStackState: { canRedo: boolean; canUndo: boolean };
    onBackClick: (() => void) | undefined;
    onDownloadPanelOpen: () => void;
}
const useStudioNavbar = ({
    projectName,
    projectConfig,
    zoom,
    undoStackState,
    onBackClick,
    onDownloadPanelOpen,
}: INavbar) => {
    const { undoRedoNavbarItem } = useNavbarUndoRedoItems(undoStackState);
    const { downloadNavbarItem } = useNavbarDownloadBtn(onDownloadPanelOpen);
    const { zoomNavbarItem } = useNavbarZoom(zoom);
    const { menuNavbarItem } = useNavbarMenu({ undoStackState, zoom, onBackClick });
    const { modeToggleNavbarItem } = useNavbarModeToggle(projectConfig);
    const { userInterfaceDropdownNavbarItem } = useUserInterfaceSelector();

    const navbarItems = useMemo((): NavbarItemType[] => {
        const projectNameItem = {
            label: 'Project information',
            content: (
                <NavbarGroup>
                    <NavbarLabel aria-label={`Project: ${projectName}`}>{decodeURI(projectName || '')}</NavbarLabel>
                </NavbarGroup>
            ),
            styles: { margin: 'auto' },
        };

        const items = [
            menuNavbarItem,
            modeToggleNavbarItem,
            userInterfaceDropdownNavbarItem,
            projectNameItem,
            undoRedoNavbarItem,
            downloadNavbarItem,
            zoomNavbarItem,
        ];
        return items.filter((item) => !!item) as NavbarItemType[];
    }, [
        undoRedoNavbarItem,
        downloadNavbarItem,
        zoomNavbarItem,
        menuNavbarItem,
        projectName,
        modeToggleNavbarItem,
        userInterfaceDropdownNavbarItem,
    ]);

    return {
        navbarItems,
    };
};

export default useStudioNavbar;

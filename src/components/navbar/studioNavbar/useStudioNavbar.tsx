import { useCallback, useMemo } from 'react';
import { ProjectConfig } from '../../../types/types';
import { SESSION_USER_INTEFACE_ID_KEY } from '../../../utils/constants';
import { NavbarGroup, NavbarText } from '../Navbar.styles';
import { NavbarItemType } from '../Navbar.types';
import useNavbarDownloadBtn from '../navbarItems/useNavbarDownloadBtn';
import useNavbarMenu from '../navbarItems/useNavbarMenu';
import useNavbarModeToggle from '../navbarItems/useNavbarModeToggle';
import useNavbarUndoRedoItems from '../navbarItems/useNavbarUndoRedo';
import useNavbarZoom from '../navbarItems/useNavbarZoom';
import useUserInterfaceSelector from '../navbarItems/useUserInterfaceSelector';

interface INavbar {
    projectName: string;
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
    const handleOnBack = useCallback(() => {
        if (onBackClick) {
            sessionStorage.removeItem(SESSION_USER_INTEFACE_ID_KEY);
            return onBackClick?.();
        }
        return undefined;
    }, [onBackClick]);

    const { menuNavbarItem } = useNavbarMenu({ undoStackState, zoom, onBackClick: handleOnBack });
    const { modeToggleNavbarItem } = useNavbarModeToggle(projectConfig);
    const { userInterfaceDropdownNavbarItem } = useUserInterfaceSelector();
    const { undoRedoNavbarItem } = useNavbarUndoRedoItems(undoStackState);
    const { downloadNavbarItem } = useNavbarDownloadBtn(onDownloadPanelOpen, true);
    const { zoomNavbarItem } = useNavbarZoom(zoom);

    const projectNameItem = useMemo(
        () => ({
            label: 'Project information',
            content: (
                <NavbarGroup>
                    <NavbarText aria-label={`Project: ${projectName}`}>{decodeURI(projectName)}</NavbarText>
                </NavbarGroup>
            ),
            styles: { margin: 'auto' },
        }),
        [projectName],
    );

    const navbarItems = useMemo((): NavbarItemType[] => {
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
        projectNameItem,
        modeToggleNavbarItem,
        userInterfaceDropdownNavbarItem,
    ]);

    return {
        navbarItems,
    };
};

export default useStudioNavbar;

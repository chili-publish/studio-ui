import { useCallback, useMemo } from 'react';
import { useTheme } from '@chili-publish/grafx-shared-components';
import useNavbarDownloadBtn from '../navbarItems/useNavbarDownloadBtn';
import useNavbarUndoRedoItems from '../navbarItems/useNavbarUndoRedo';
import useNavbarZoom from '../navbarItems/useNavbarZoom';
import { NavbarItemType } from '../Navbar.types';
import { NavbarGroup, NavbarText } from '../Navbar.styles';
import useNavbarMenu from '../navbarItems/useNavbarMenu';
import useNavbarModeToggle from '../navbarItems/useNavbarModeToggle';
import useUserInterfaceSelector from '../navbarItems/useUserInterfaceSelector';
import { ProjectConfig } from '../../../types/types';
import { SESSION_USER_INTEFACE_ID_KEY } from '../../../utils/constants';

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
    const handleOnBack = useCallback(() => {
        if (onBackClick) {
            sessionStorage.removeItem(SESSION_USER_INTEFACE_ID_KEY);
            return onBackClick?.();
        }
        return undefined;
    }, [onBackClick]);
    const { menuNavbarItem } = useNavbarMenu({ undoStackState, zoom, onBackClick: handleOnBack });

    const { undoRedoNavbarItem } = useNavbarUndoRedoItems(undoStackState);
    const { downloadNavbarItem } = useNavbarDownloadBtn(onDownloadPanelOpen);
    const { zoomNavbarItem } = useNavbarZoom(zoom);
    const { modeToggleNavbarItem } = useNavbarModeToggle(projectConfig);
    const { userInterfaceDropdownNavbarItem } = useUserInterfaceSelector();
    const { themeColors } = useTheme();

    const navbarItems = useMemo((): NavbarItemType[] => {
        const projectNameItem = {
            label: 'Project information',
            content: (
                <NavbarGroup>
                    <NavbarText aria-label={`Project: ${projectName}`} themeColors={themeColors}>
                        {decodeURI(projectName || '')}
                    </NavbarText>
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
        themeColors,
    ]);

    return {
        navbarItems,
    };
};

export default useStudioNavbar;

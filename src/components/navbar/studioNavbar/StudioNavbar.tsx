import { useTheme } from '@chili-publish/grafx-shared-components';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import { NavbarItem, StyledNavbar } from '../Navbar.styles';
import DownloadPanel from '../downloadPanel/DownloadPanel';
import useNavbar from '../useNavbar';
import { INavbar } from '../Navbar.types';
import useDownloadPanel from '../useDownloadPanel';

function StudioNavbar(props: INavbar) {
    const { projectName, goBack, projectConfig, zoom, undoStackState } = props;

    const { panel, mode } = useTheme();
    const { isDownloadPanelVisible, showDownloadPanel, hideDownloadPanel, handleDownload } =
        useDownloadPanel(projectConfig);

    const { navbarItems } = useNavbar({
        projectName,
        zoom,
        undoStackState,
        onBackClick: goBack,
        onDownloadPanelOpen: showDownloadPanel,
    });
    return (
        <StyledNavbar
            data-id={getDataIdForSUI('studio-navbar')}
            data-testid={getDataTestIdForSUI('studio-navbar')}
            panelTheme={panel}
            mode={mode}
        >
            <ul>
                {navbarItems.map((item) => (
                    <NavbarItem
                        data-id={getDataIdForSUI(`studio-navbar-item-${item.label}`)}
                        data-testid={getDataTestIdForSUI(`studio-navbar-item-${item.label}`)}
                        aria-label={item.label}
                        key={item.label}
                        hideOnMobile={item.hideOnMobile}
                    >
                        {item.content}
                    </NavbarItem>
                ))}
            </ul>
            <DownloadPanel
                isDownloadPanelVisible={isDownloadPanelVisible}
                hideDownloadPanel={hideDownloadPanel}
                handleDownload={handleDownload}
            />
        </StyledNavbar>
    );
}

export default StudioNavbar;

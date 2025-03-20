import { css } from 'styled-components';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import DownloadPanel from '../downloadPanel/DownloadPanel';
import { NavbarItem, STUDIO_NAVBAR_HEIGHT, StyledNavbar } from '../Navbar.styles';
import { INavbar } from '../Navbar.types';
import useDownloadPanel from '../useDownloadPanel';
import useStudioNavbar from './useStudioNavbar';

function StudioNavbar(props: INavbar) {
    const { projectName, goBack, projectConfig, zoom, undoStackState } = props;

    const { isDownloadPanelVisible, showDownloadPanel, hideDownloadPanel, handleDownload } = useDownloadPanel(
        projectConfig,
        projectName,
    );

    const { navbarItems } = useStudioNavbar({
        projectName,
        projectConfig,
        zoom,
        undoStackState,
        onBackClick: goBack,
        onDownloadPanelOpen: showDownloadPanel,
    });
    return (
        <StyledNavbar
            id="sui-navbar"
            data-id={getDataIdForSUI('navbar')}
            data-testid={getDataTestIdForSUI('navbar')}
            styles={css`
                box-sizing: content-box;
                height: ${STUDIO_NAVBAR_HEIGHT};
                padding: 0;
                padding-right: 0.5rem;
                ul {
                    gap: 0.5rem;
                }
            `}
        >
            <ul>
                {navbarItems.map((item) => (
                    <NavbarItem
                        data-id={getDataIdForSUI(`studio-navbar-item-${item.label}`)}
                        data-testid={getDataTestIdForSUI(`studio-navbar-item-${item.label}`)}
                        aria-label={item.label}
                        key={item.label}
                        hideOnMobile={item.hideOnMobile}
                        styles={item.styles}
                    >
                        {item.content}
                    </NavbarItem>
                ))}
            </ul>
            <DownloadPanel
                isDownloadPanelVisible={isDownloadPanelVisible}
                hideDownloadPanel={hideDownloadPanel}
                handleDownload={handleDownload}
                isSandBoxMode={projectConfig.sandboxMode}
            />
        </StyledNavbar>
    );
}

export default StudioNavbar;

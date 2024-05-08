import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { StyledNavbar, NavbarItem } from './Navbar.styles';
import { INavbar } from './Navbar.types';
import DownloadPanel from './downloadPanel/DownloadPanel';
import useNavbar from './useNavbar';

function Navbar(props: INavbar) {
    const { projectName, goBack, projectConfig, zoom, undoStackState } = props;

    const {
        navbarItems,
        isDownloadPanelVisible,
        hideDownloadPanel,
        handleDownload,
        setHasDownloadError,
        hasDownloadError,
    } = useNavbar(projectName, goBack, zoom, undoStackState, projectConfig);

    return (
        <StyledNavbar data-id={getDataIdForSUI('navbar')} data-testid={getDataTestIdForSUI('navbar')}>
            <ul>
                {navbarItems.map((item) => (
                    <NavbarItem
                        data-id={getDataIdForSUI(`navbar-item-${item.label}`)}
                        data-testid={getDataTestIdForSUI(`navbar-item-${item.label}`)}
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
                setHasDownloadError={setHasDownloadError}
                hasDownloadError={hasDownloadError}
            />
        </StyledNavbar>
    );
}

export default Navbar;

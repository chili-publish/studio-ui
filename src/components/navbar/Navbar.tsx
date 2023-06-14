import { StyledNavbar, NavbarItem } from './Navbar.styles';
import { INavbar } from './Navbar.types';
import DownloadPanel from './downloadPanel/DownloadPanel';
import useNavbar from './useNavbar';

function Navbar(props: INavbar) {
    const { projectName, goBack, projectConfig } = props;
    const { navbarItems, isDownloadPanelShown, hideDownloadPanel, handleDownload } = useNavbar(
        projectName,
        goBack,
        projectConfig,
    );

    return (
        <StyledNavbar data-testid="navbar">
            <ul>
                {navbarItems.map((item) => (
                    <NavbarItem aria-label={item.label} key={item.label} hideOnMobile={item.hideOnMobile}>
                        {item.content}
                    </NavbarItem>
                ))}
            </ul>
            <DownloadPanel
                isDownloadPanelShown={isDownloadPanelShown}
                hideDownloadPanel={hideDownloadPanel}
                handleDownload={handleDownload}
            />
        </StyledNavbar>
    );
}

export default Navbar;

import { StyledNavbar, NavbarItem } from './Navbar.styles';
import { INavbar } from './Navbar.types';
import DownloadPanel from './downloadPanel/DownloadPanel';
import useNavbar from './useNavbar';

function Navbar(props: INavbar) {
    const { projectName, goBack } = props;
    const { navbarItems, isDownloadPanelShown, hideDownloadPanel } = useNavbar(projectName, goBack);

    return (
        <StyledNavbar data-testid="navbar">
            <ul>
                {navbarItems.map((item) => (
                    <NavbarItem aria-label={item.label} key={item.label} hideOnMobile={item.hideOnMobile}>
                        {item.content}
                    </NavbarItem>
                ))}
            </ul>
            <DownloadPanel isDownloadPanelShown={isDownloadPanelShown} hideDownloadPanel={hideDownloadPanel} />
        </StyledNavbar>
    );
}

export default Navbar;

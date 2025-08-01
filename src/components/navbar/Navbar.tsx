import { css } from 'styled-components';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { NavbarItem, StyledNavbar } from './Navbar.styles';
import { INavbar } from './Navbar.types';
import DownloadPanel from './downloadPanel/DownloadPanel';
import useDownloadPanel from './useDownloadPanel';
import useNavbar from './useNavbar';
import { useUiConfigContext } from '../../contexts/UiConfigContext';

function Navbar(props: INavbar) {
    const { projectName, goBack, zoom, undoStackState, selectedLayoutId } = props;

    const { projectConfig } = useUiConfigContext();

    // eslint-disable-next-line no-console
    console.log('projectConfig updated - Navbar', projectConfig);

    const { isDownloadPanelVisible, showDownloadPanel, hideDownloadPanel, handleDownload } = useDownloadPanel(
        projectConfig,
        projectName,
        selectedLayoutId,
    );

    const { navbarItems } = useNavbar({
        projectName,
        zoom,
        undoStackState,
        onBackClick: goBack,
        onDownloadPanelOpen: showDownloadPanel,
    });

    return (
        <StyledNavbar
            data-id={getDataIdForSUI('navbar')}
            data-testid={getDataTestIdForSUI('navbar')}
            styles={css`
                ul {
                    gap: 1rem;
                }
            `}
        >
            <ul>
                {navbarItems.map((item) => (
                    <NavbarItem
                        data-id={getDataIdForSUI(`navbar-item-${item.label}`)}
                        data-testid={getDataTestIdForSUI(`navbar-item-${item.label}`)}
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
            />
        </StyledNavbar>
    );
}

export default Navbar;

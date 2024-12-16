import { useTheme } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { useUiConfigContext } from '../../contexts/UiConfigContext';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { StyledNavbar, NavbarItem } from './Navbar.styles';
import { INavbar } from './Navbar.types';
import DownloadPanel from './downloadPanel/DownloadPanel';
import useNavbar from './useNavbar';
import useDownloadPanel from './useDownloadPanel';

function Navbar(props: INavbar) {
    const { projectName, goBack, projectConfig, zoom, undoStackState } = props;
    const { uiOptions } = useUiConfigContext();

    const { isDownloadPanelVisible, showDownloadPanel, hideDownloadPanel, handleDownload } =
        useDownloadPanel(projectConfig);

    const { navbarItems } = useNavbar({
        projectName,
        zoom,
        undoStackState,
        onBackClick: goBack,
        onDownloadPanelOpen: showDownloadPanel,
    });

    const { panel, mode } = useTheme();
    if (uiOptions.widgets.navBar && !uiOptions.widgets.navBar.visible) return null;
    return (
        <StyledNavbar
            data-id={getDataIdForSUI('navbar')}
            data-testid={getDataTestIdForSUI('navbar')}
            panelTheme={panel}
            mode={mode}
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

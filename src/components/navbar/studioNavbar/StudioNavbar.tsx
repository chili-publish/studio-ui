import { Button, useMobileSize, useTheme } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { useState } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import { NavbarItem, StyledNavbar } from '../Navbar.styles';
import DownloadPanel from '../downloadPanel/DownloadPanel';
import { INavbar } from '../Navbar.types';
import useDownloadPanel from '../useDownloadPanel';
import useStudioNavbar from './useStudioNavbar';
import TableModal from './TableModal';
import TableTray from './TableTray';

function StudioNavbar(props: INavbar) {
    const { projectName, goBack, projectConfig, zoom, undoStackState } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTrayOpen, setIsTrayOpen] = useState(false);

    const isMobileSize = useMobileSize();
    const { panel, mode } = useTheme();
    const { isDownloadPanelVisible, showDownloadPanel, hideDownloadPanel, handleDownload } =
        useDownloadPanel(projectConfig);

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
            panelTheme={panel}
            mode={mode}
            styles={css`
                height: 3rem;
                padding: 0 0.5rem;
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

                <Button
                    label="Test table"
                    onClick={() => {
                        if (isMobileSize) {
                            setIsTrayOpen(true);
                        } else {
                            setIsModalOpen(true);
                        }
                    }}
                />
            </ul>

            {isModalOpen ? <TableModal onClose={() => setIsModalOpen(false)} /> : null}
            {isTrayOpen ? <TableTray onClose={() => setIsTrayOpen(false)} /> : null}

            <DownloadPanel
                isDownloadPanelVisible={isDownloadPanelVisible}
                hideDownloadPanel={hideDownloadPanel}
                handleDownload={handleDownload}
            />
        </StyledNavbar>
    );
}

export default StudioNavbar;

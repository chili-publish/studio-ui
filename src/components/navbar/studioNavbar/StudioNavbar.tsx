import { css } from 'styled-components';
import { useGetIframeAsync } from '@chili-publish/grafx-shared-components';
import { useEffect, useRef } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import DownloadPanel from '../downloadPanel/DownloadPanel';
import { NavbarItem, STUDIO_NAVBAR_HEIGHT, StyledNavbar } from '../Navbar.styles';
import { INavbar } from '../Navbar.types';
import useDownloadPanel from '../useDownloadPanel';
import useStudioNavbar from './useStudioNavbar';

function StudioNavbar(props: INavbar) {
    const { projectName, goBack, projectConfig, zoom, undoStackState, selectedLayoutId } = props;
    const iframe = useGetIframeAsync({ containerId: 'studio-ui-chili-editor' })?.contentWindow;
    const { isDownloadPanelVisible, showDownloadPanel, hideDownloadPanel, handleDownload } = useDownloadPanel(
        projectConfig,
        projectName,
        selectedLayoutId,
    );

    const exportButtonRef = useRef<HTMLLIElement>(null);

    const { navbarItems } = useStudioNavbar({
        projectName,
        projectConfig,
        zoom,
        undoStackState,
        onBackClick: goBack,
        onDownloadPanelOpen: showDownloadPanel,
    });

    useEffect(() => {
        const handleShortcut = (e: KeyboardEvent) => {
            if (e.metaKey && e.key.toLowerCase() === 'e') {
                if (isDownloadPanelVisible) {
                    hideDownloadPanel();
                } else {
                    showDownloadPanel();
                }
            }
        };

        document.addEventListener('keydown', handleShortcut);
        iframe?.addEventListener('keydown', handleShortcut);

        return () => {
            document.removeEventListener('keydown', handleShortcut);
            iframe?.removeEventListener('keydown', handleShortcut);
        };
    }, [hideDownloadPanel, iframe, isDownloadPanelVisible, showDownloadPanel]);

    return (
        <StyledNavbar
            id="sui-navbar"
            data-id={getDataIdForSUI('navbar')}
            data-testid={getDataTestIdForSUI('navbar')}
            styles={css`
                box-sizing: content-box;
                height: ${STUDIO_NAVBAR_HEIGHT};
                padding: 0;
                padding-inline-end: 0.5rem;
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
                        ref={item.label === 'Export' || item.label === 'Download' ? exportButtonRef : undefined}
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
                exportButtonRef={exportButtonRef}
            />
        </StyledNavbar>
    );
}

export default StudioNavbar;

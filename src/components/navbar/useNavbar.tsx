import { AvailableIcons, ButtonVariant } from '@chili-publish/grafx-shared-components';
import { useMemo, useState } from 'react';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import NavbarButton from '../navbarButton/NavbarButton';
import Zoom from '../zoom/Zoom';
import { NavbarGroup, NavbarLabel } from './Navbar.styles';
import { NavbarItemType } from './Navbar.types';
import useMobileSize from '../../hooks/useMobileSize';
import { ProjectConfig } from '../../types/types';
import { getDownloadLink } from '../../utils/documentExportHelper';

const useNavbar = (
    projectName: string | undefined,
    goBack: (() => void) | undefined,
    projectConfig?: ProjectConfig,
) => {
    const isMobile = useMobileSize();
    const hasHistory = false; // This should be dynamic
    const [isDownloadPanelVisible, setIsDownloadPanelVisible] = useState(false);

    const hideDownloadPanel = () => {
        setIsDownloadPanelVisible(false);
    };

    const showDownloadPanel = () => {
        setIsDownloadPanelVisible(true);
    };

    const navbarItems = useMemo(
        (): NavbarItemType[] => [
            {
                label: 'Project information',
                content: (
                    <NavbarGroup>
                        <NavbarButton
                            ariaLabel="Go back"
                            icon={AvailableIcons.faArrowLeft}
                            handleOnClick={goBack || (() => null)}
                        />
                        <NavbarLabel aria-label={`Project: ${projectName}`}>{projectName}</NavbarLabel>
                    </NavbarGroup>
                ),
            },
            {
                label: 'Actions',
                content: (
                    <NavbarGroup withGap>
                        <NavbarButton
                            ariaLabel="Undo"
                            icon={AvailableIcons.faArrowTurnDownLeft}
                            flipIconY
                            disabled={!hasHistory}
                            handleOnClick={() => null}
                        />
                        <NavbarButton
                            ariaLabel="Redo"
                            icon={AvailableIcons.faArrowTurnDownRight}
                            flipIconY
                            handleOnClick={() => null}
                        />
                    </NavbarGroup>
                ),
            },
            {
                label: 'Download',
                content: (
                    <NavbarButton
                        ariaLabel="Download"
                        label={
                            !isMobile ? (
                                <NavbarLabel key="Download" hideOnMobile>
                                    Download
                                </NavbarLabel>
                            ) : undefined
                        }
                        icon={AvailableIcons.faArrowDownToLine}
                        variant={ButtonVariant.primary}
                        handleOnClick={showDownloadPanel}
                    />
                ),
            },
            {
                label: 'Zoom',
                content: <Zoom />,
                hideOnMobile: true,
            },
        ],
        [goBack, projectName, hasHistory, isMobile],
    );

    const handleDownload = async (extension: DownloadFormats) => {
        try {
            const { data: downloadURL } = await getDownloadLink(
                extension,
                projectConfig?.graFxStudioEnvironmentApiBaseUrl ?? '',
                projectConfig?.authToken ?? '',
                '0',
                projectConfig?.templateId ?? '',
            );

            const config = { headers: { Authorization: `Bearer ${projectConfig?.authToken}` } };
            const response = await fetch(downloadURL ?? '', config);

            if (response.status !== 200) return;

            const objectUrl = window.URL.createObjectURL(await response.blob());
            const a = Object.assign(document.createElement('a'), {
                href: objectUrl,
                style: 'display: none',
                download: `export.${extension}`,
            });
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
        hideDownloadPanel();
    };

    return { navbarItems, showDownloadPanel, hideDownloadPanel, isDownloadPanelVisible, handleDownload };
};

export default useNavbar;

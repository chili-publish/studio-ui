import { AvailableIcons, ButtonVariant } from '@chili-publish/grafx-shared-components';
import { useMemo, useState } from 'react';
import NavbarButton from '../navbarButton/NavbarButton';
import Zoom from '../zoom/Zoom';
import { NavbarGroup, NavbarLabel } from './Navbar.styles';
import { NavbarItemType } from './Navbar.types';
import useMobileSize from '../../hooks/useMobileSize';

const useNavbar = (projectName: string | undefined, goBack: (() => void) | undefined) => {
    const isMobile = useMobileSize();
    const hasHistory = false; // This should be dynamic
    const [isDownloadPanelShown, setIsDownloadPanelShown] = useState(false);

    const hideDownloadPanel = () => {
        setIsDownloadPanelShown(false);
    };

    const showDownloadPanel = () => {
        setIsDownloadPanelShown(true);
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

    return { navbarItems, showDownloadPanel, hideDownloadPanel, isDownloadPanelShown };
};

export default useNavbar;

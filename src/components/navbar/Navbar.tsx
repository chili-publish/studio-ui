import { useMemo } from 'react';
import { AvailableIcons, ButtonVariant } from '@chili-publish/grafx-shared-components';
import { StyledNavbar, NavbarGroup, NavbarItem, NavbarLabel } from './Navbar.styles';
import { INavbar, NavbarItemType } from './Navbar.types';
import Zoom from '../zoom/Zoom';
import NavbarButton from '../navbarButton/NavbarButton';
import useMobileSize from '../../hooks/useMobileSize';

function Navbar(props: INavbar) {
    const { projectName, goBack } = props;
    const isMobile = useMobileSize();
    const hasHistory = false; // This should be dynamic

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
                        handleOnClick={() => null}
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

    return (
        <StyledNavbar data-testid="navbar">
            <ul>
                {navbarItems.map((item) => (
                    <NavbarItem aria-label={item.label} key={item.label} hideOnMobile={item.hideOnMobile}>
                        {item.content}
                    </NavbarItem>
                ))}
            </ul>
        </StyledNavbar>
    );
}

export default Navbar;

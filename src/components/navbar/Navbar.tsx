import { useMemo } from 'react';
import { ButtonTypes, AvailableIcons } from '@chili-publish/grafx-shared-components';
import { StyledNavbar, NavbarGroup, NavbarItem, NavbarLabel } from './Navbar.styles';
import { NavbarItemType } from './Navbar.types';
import Zoom from '../zoom/Zoom';
import NavbarButton from '../navbarButton/NavbarButton';
import useMobileSize from '../../hooks/useMobileSize';

function Navbar() {
    const isMobile = useMobileSize();
    const projectName = 'Project 1'; // This should be dynamic
    const hasHistory = false; // This should be dynamic

    const navbarItems = useMemo(
        (): NavbarItemType[] => [
            {
                label: 'Project information',
                content: (
                    <NavbarGroup>
                        <NavbarButton ariaLabel="Go back" icon={AvailableIcons.faArrowLeft} />
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
                        />
                        <NavbarButton ariaLabel="Redo" icon={AvailableIcons.faArrowTurnDownRight} flipIconY />
                    </NavbarGroup>
                ),
            },
            {
                label: 'Download',
                content: (
                    <NavbarButton
                        ariaLabel="Download"
                        label={!isMobile ? <NavbarLabel key="label-Download">Download</NavbarLabel> : undefined}
                        icon={AvailableIcons.faArrowDownToLine}
                        buttonType={ButtonTypes.primary}
                    />
                ),
            },
            {
                label: 'Zoom',
                content: <Zoom />,
                hideOnMobile: true,
            },
        ],
        [projectName, hasHistory, isMobile],
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

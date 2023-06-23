import styled from 'styled-components';
import { Colors, FontSizes } from '@chili-publish/grafx-shared-components';
import { mobileMediaQuery } from '../../utils/media-utils';

export const StyledNavbar = styled.nav`
    box-sizing: border-box;
    height: 4rem;
    padding: 0.75rem 1rem;
    background-color: ${Colors.PRIMARY_WHITE};
    border-bottom: 2px solid ${Colors.PRIMARY_DROPDOWN_BACKGROUND};
    color: ${Colors.SECONDARY_FONT};

    ul {
        display: flex;
        list-style-type: none;
        height: 100%;
        align-items: center;
        margin: 0px;
        margin-block-start: 0;
        margin-block-end: 0;
        padding-inline-start: 0;
        gap: 1rem;
    }
`;

export const NavbarItem = styled.li<{ hideOnMobile?: boolean }>`
    & svg {
        height: 1.125rem;
    }

    &:nth-child(2) {
        margin-left: auto;
    }

    ${mobileMediaQuery} {
        display: ${(props) => (props.hideOnMobile ? 'none !important' : 'list-item')};
    }
`;

export const NavbarLabel = styled.span<{ hideOnMobile?: boolean }>`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: ${FontSizes.regular};

    ${mobileMediaQuery} {
        display: ${(props) => (props.hideOnMobile ? 'none !important' : 'list-item')};
        max-width: 15ch;
    }
`;

export const NavbarGroup = styled.div<{ withGap?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    ${(props) => props.withGap && 'gap: 4px'};
`;

import styled, { css, CSSProp } from 'styled-components';
import { FontSizes, ITheme } from '@chili-publish/grafx-shared-components';
import { mobileMediaQuery } from '../../utils/mediaUtils';
import { Text } from '../../styles/Main.styles';

export const STUDIO_NAVBAR_HEIGHT = '3rem';
const NAVBAR_HEIGHT = '4rem';

export const StyledNavbar = styled.nav<{ panelTheme: ITheme['panel']; mode: ITheme['mode']; styles?: CSSProp }>`
    box-sizing: border-box;
    height: ${NAVBAR_HEIGHT};
    padding: 0.75rem 1rem;
    background-color: ${(props) => props.panelTheme.backgroundColor};
    border-bottom: 2px solid ${(props) => props.panelTheme.borderColor};
    position: relative;
    z-index: 2;
    ul {
        display: flex;
        list-style-type: none;
        height: 100%;
        align-items: center;
        margin: 0px;
        margin-block-start: 0;
        margin-block-end: 0;
        padding-inline-start: 0;
    }
    ${(props) => props.styles && props.styles};
`;

export const NavbarItem = styled.li<{ hideOnMobile?: boolean; styles?: CSSProp }>`
    ${mobileMediaQuery} {
        display: ${(props) => (props.hideOnMobile ? 'none !important' : 'list-item')};
    }
    ${(props) => props.styles && props.styles};
`;

const labelStyle = css<{ hideOnMobile?: boolean }>`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: ${FontSizes.regular};
    ${mobileMediaQuery} {
        display: ${(props) => (props.hideOnMobile ? 'none !important' : 'list-item')};
        max-width: 15ch;
    }
`;
export const NavbarText = styled(Text)`
    ${labelStyle};
`;
export const NavbarLabel = styled.span<{ hideOnMobile?: boolean }>`
    ${labelStyle};
`;

export const NavbarGroup = styled.div<{ withGap?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    ${(props) => props.withGap && 'gap: 4px'};
`;

export const MenuOption = styled.div`
    display: flex;
    justify-content: space-between;
`;

import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';
import { mobileMediaQuery } from '../../utils/mediaUtils';

const FILTER_HEIGHT = '2.5rem';
const FILTER_MARGIN_BOTTOM = '1rem';

const NAVIGATION_HEIGHT = '2.5rem';
const SCROLLABLE_PANEL_MARGIN_TOP = '1rem';
const NAVIGATION_MARGIN_BOTTOM = '0.5rem';

interface ScrollbarContainerProps {
    filteringEnabled?: boolean;
    navigationBreadcrumbsEnabled?: boolean;
    hasSearchQuery?: boolean;
}
interface StyledScrollbarContainerProps extends ScrollbarContainerProps {
    height: string;
}

export const ResourcesContainer = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: 7.5rem 7.5rem;
    gap: 1.3rem;
    ${mobileMediaQuery} {
        grid-template-columns: minmax(7.5rem, 1fr) minmax(7.5rem, 1fr);
        gap: 1rem;
    }
`;

export const ModalResourcesContainer = styled.div<{ width?: string }>`
    box-sizing: border-box;
    display: flex;
    height: 100%;
    width: ${(props) => props.width ?? '100%'};
    align-content: flex-start;
    flex-wrap: wrap;
    flex-direction: row;
    padding: 0.75rem;
`;

export const NavigationWrapper = styled.div<{ isMobile: boolean }>`
    display: flex;
    align-items: center;
    position: relative;
    margin-inline-start: -0.75rem;
    margin-inline-end: ${(props) => (props.isMobile ? '0' : '1.25rem')};

    flex: 1;
    overflow: hidden;

    svg {
        box-sizing: content-box !important;
        padding-block: 0.5rem;
        padding-inline: 0.5625rem !important;
        ${({ theme }) => `color: ${theme.themeColors.primaryTextColor} !important`};
    }

    & svg.close-icon,
    & svg.path-icon {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }

    & svg.path-icon {
        left: -0.5rem;
    }

    & svg.close-icon {
        right: -0.5rem;
    }

    & svg.path-icon + .navigation-path {
        margin-inline-start: 1.5rem;
    }
`;

export const NavigationTitle = styled.div`
    overflow: hidden;
    font-weight: 500;
    text-overflow: ellipsis;
    font-size: ${FontSizes.header};
    white-space: nowrap;
`;

export const ResourcesPreview = styled.div<{ width?: string }>`
    width: ${(props) => props.width ?? '50%'};
`;

export const LoadPageContainer = styled.div`
    display: block;
    width: 100%;
`;

export const BreadCrumbsWrapper = styled.div`
    width: 15.625rem;
    height: ${NAVIGATION_HEIGHT};
    margin-bottom: ${NAVIGATION_MARGIN_BOTTOM};
    overflow: visible;
    white-space: nowrap;
    display: flex;
    margin-top: 1px;
    & .grafx-select__control {
        &:hover {
            border: 1px solid transparent !important;
        }
        &--is-focused {
            border: 1px solid transparent !important;
        }
    }
`;

export const ScrollbarContainer = styled.div.attrs<ScrollbarContainerProps>((props) => {
    const navigationBarTotalHeight = `calc(${NAVIGATION_HEIGHT} + ${NAVIGATION_MARGIN_BOTTOM})`;
    const searchBarTotalHeight = `calc(${FILTER_HEIGHT} + ${props.hasSearchQuery ? FILTER_MARGIN_BOTTOM : '0px'})`;

    const height = `calc(100% - ${props.filteringEnabled ? searchBarTotalHeight : '0px'} - ${
        props.navigationBreadcrumbsEnabled ? navigationBarTotalHeight : '0px'
    } - ${SCROLLABLE_PANEL_MARGIN_TOP} - 0.5rem)`;

    return { ...props, height };
})<Partial<StyledScrollbarContainerProps>>`
    width: 100%;
    height: ${(props) => props.height};
    margin-top: ${SCROLLABLE_PANEL_MARGIN_TOP};
    @media (hover: none), (hover: on-demand) {
        > div {
            overflow-y: auto;
        }
    }
`;
export const SearchInputWrapper = styled.div<{ hasSearchQuery?: boolean; isMobile?: boolean }>`
    width: ${(props) => (props.isMobile ? '100%' : '16.25rem')};
    height: ${FILTER_HEIGHT};
    ${(props) =>
        props.hasSearchQuery &&
        `
        margin-bottom: ${FILTER_MARGIN_BOTTOM};
    `};
`;

export const EmptySearchResultContainer = styled.div`
    padding-block: 0;
    padding-inline: calc(3.75rem - 1.25rem) 3.75rem;
    color: ${({ theme }) => theme.themeColors.secondaryTextColor};
    font-size: 0.875rem;
    text-align: center;
`;

import { Colors, FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';
import { mobileMediaQuery } from '../../utils/mediaUtils';

export const ResourcesContainer = styled.div`
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

export const NavigationWrapper = styled.div`
    display: flex;
    align-items: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    position: relative;
    margin-left: -0.75rem;

    & svg {
        box-sizing: content-box !important;
        padding: 0.5rem 0.5625rem !important;
    }

    & svg path {
        color: ${Colors.PRIMARY_FONT};
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
        margin-left: 1.5rem;
    }
`;

export const NavigationTitle = styled.div`
    display: flex;
    align-items: center;
    max-width: 75%;
    overflow: hidden;
    font-weight: 500;
    text-overflow: ellipsis;
    color: ${Colors.PRIMARY_FONT};
    font-size: ${FontSizes.header};
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
    height: 2.5rem;
    overflow: visible;
    white-space: nowrap;
    display: flex;
    margin-bottom: 1rem;
`;

export const SearchInputWrapper = styled.div<{ hasSearchQuery?: boolean; isMobile?: boolean }>`
    width: ${(props) => (props.isMobile ? '100%' : '16.25rem')};
    ${(props) =>
        props.hasSearchQuery &&
        `
        margin-bottom: 1rem;
    `};
`;

export const EmptySearchResultContainer = styled.div`
    padding: 0 3.75rem 0 calc(3.75rem - 1.25rem);
    color: ${Colors.SECONDARY_FONT};
    font-size: 0.875rem;
    text-align: center;
`;

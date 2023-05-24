import { Colors, FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const ResourcesContainer = styled.div`
    display: flex;
    height: 100%;
    overflow: scroll;
    align-content: flex-start;
    flex-wrap: wrap;

    padding: 0 0.875rem 1.75rem 0.875rem;
    justify-content: space-between;
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
    margin-left: 0.5rem;

    & svg {
        padding: 0.5rem 0.5625rem !important;
    }

    & svg:hover path {
        color: ${Colors.PRIMARY_WHITE};
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
    width: 250px;
    height: 2.5rem;
    margin-left: 1.5rem;
    overflow: visible;
    white-space: nowrap;
    display: flex;
`;

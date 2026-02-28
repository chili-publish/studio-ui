import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled, { createGlobalStyle } from 'styled-components';

export const MobileToolbarWrapper = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 5rem;
    background-color: ${({ theme }) => theme.panel.backgroundColor};
    border: 1px solid ${({ theme }) => theme.panel.borderColor};
    padding: 0rem 1rem;

    display: flex;
    align-items: stretch;
    justify-content: space-between;
    > * {
        flex: 1;
        height: 100%;
    }
`;

export const ListViewTrayStyle = createGlobalStyle`
    [data-id='gsc-tray-body'] {
        padding: 0 !important;
        padding-top: 0.5rem;
    }
`;

export const TrayTitle = styled.h2`
    font-size: ${FontSizes.header};
    font-weight: 500;
    margin: 0;
`;

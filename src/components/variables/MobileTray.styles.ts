import styled, { css } from 'styled-components';
import { createGlobalStyle } from 'styled-components';

export const dataSourceTrayStyles = css`
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
`;

export const DataSourceTableWrapper = styled.div`
    overflow: auto !important;
    margin-top: 1.5rem;
`;

export const TrayStyle = createGlobalStyle`
    &[data-id='gsc-tray-header'] {
        padding: 0.5rem 1.25rem;
        padding-bottom: 0;
    }
`;

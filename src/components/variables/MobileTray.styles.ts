import styled, { css, createGlobalStyle } from 'styled-components';

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
        padding: 0.5rem 0;
        padding-bottom: 0;
    }
    &[data-id='gsc-tray-body'] {
        padding: 0;
    }
`;

export const VariablesListTrayStyle = createGlobalStyle`
    &[data-id='gsc-tray-body'] {
        padding: 0;
        padding-top: 0.5rem;
    }
`;

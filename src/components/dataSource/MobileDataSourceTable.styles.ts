import { createGlobalStyle } from 'styled-components';

export const TRAY_ID = 'table-tray';

export const TrayStyle = createGlobalStyle`
    &[data-id='gsc-tray-header'] {
        padding: 0.5rem 1.25rem;
        padding-bottom: 0;
    }
`;

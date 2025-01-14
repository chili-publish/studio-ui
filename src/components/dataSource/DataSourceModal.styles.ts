import { createGlobalStyle } from 'styled-components';

export const MODAL_ID = 'data-source-table';
export const ModalStyle = createGlobalStyle`
   #${MODAL_ID} {
        padding-bottom: 0;
    }
    &[data-id='gsc-modal-body'] {
        overflow: auto !important;
    }
`;

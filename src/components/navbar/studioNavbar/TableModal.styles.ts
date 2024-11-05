import styled, { createGlobalStyle } from 'styled-components';

export const MODAL_ID = 'data-source-table';
export const ModalStyle = createGlobalStyle`
   #${MODAL_ID} {
        padding-bottom: 0;
    }
    #${MODAL_ID}-overlay {
        z-index: 3;
    }
    &[data-id='gsc-modal-body'] {
        overflow: auto !important;
    }
`;

export const TableWrapper = styled.span`
    table {
        margin-bottom: 2.5rem;
    }
`;

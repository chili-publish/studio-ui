import styled, { createGlobalStyle } from 'styled-components';

export const MODAL_ID = 'data-source-table';
export const ModalStyle = createGlobalStyle`
   #${MODAL_ID} {
        padding-bottom: 0;
    }
    &[data-id='gsc-modal-body'] {
        overflow: auto !important;
        padding-bottom: 2.5rem !important;
    }
`;

export const TableWrapper = styled.div`
    width: 100%;
    display: contents;
    margin-bottom: 2.5rem;
`;

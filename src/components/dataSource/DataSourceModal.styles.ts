import styled, { createGlobalStyle } from 'styled-components';

export const MODAL_ID = 'data-source-table';
export const ModalStyle = createGlobalStyle`
   #${MODAL_ID} {
        padding-bottom: 0;
    }
    &[data-id='gsc-modal-header'] {
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-break: break-word;
    }
    &[data-id='gsc-modal-body'] {
        overflow: auto;
    }
`;

export const PageSizeToolbar = styled.div`
    display: flex;
    margin-bottom: 1rem;
`;

import { createGlobalStyle } from 'styled-components';

export const MODAL_ID = 'data-source-table';
export const ModalStyle = createGlobalStyle<{ centerContent?: boolean }>`
   #${MODAL_ID} {
        padding-bottom: 0;
        min-height: 38rem;
    }
    &[data-id='gsc-modal-header'] {
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-break: break-word;
    }
    &[data-id='gsc-modal-body'] {
        overflow: auto;
        margin-bottom: 1rem;

        display: flex;
        justify-content: center;

        ${({ centerContent }) =>
            centerContent &&
            `
            align-items: center;
        `}
    }
`;

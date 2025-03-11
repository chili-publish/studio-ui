import styled from 'styled-components';

export const DATA_SOURCE_TOAST_ID = 'data-source-toast';

// custom styling for data source toast notification (temporary solution until stacked toasts are implemented)
export const NotificationWrapper = styled.div`
    & > div {
        z-index: 2;
    }
    display: flex;
    justify-content: center;
    width: 100%;
    position: absolute;
    top: 0;

    [data-id='${DATA_SOURCE_TOAST_ID}'] {
        height: auto;
        position: fixed;
        bottom: 1rem;
        transform: none !important;
    }
`;

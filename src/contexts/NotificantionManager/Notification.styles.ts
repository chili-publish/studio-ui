import styled from 'styled-components';

export const NotificationWrapper = styled.div`
    & > div {
        z-index: 2;
    }
    display: flex;
    justify-content: center;
    width: 100%;
    position: absolute;
    top: 0;
`;

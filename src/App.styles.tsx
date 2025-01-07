import styled from 'styled-components';

const SANDBOX_NAVBAR_HEIGHT = '3rem';
const NAVBAR_HEIGHT = '4rem';

export const MainContentContainer = styled.div<{ sandboxMode?: boolean; fullHeight?: boolean }>`
    display: flex;
    height: ${(props) =>
        props.fullHeight ? `100%` : `calc(100vh - ${props.sandboxMode ? SANDBOX_NAVBAR_HEIGHT : NAVBAR_HEIGHT})`};
    width: 100%;
    z-index: 1;
    position: relative;
`;

export const CanvasContainer = styled.div`
    width: 100%;
`;

export const Container = styled.div`
    background-color: ${({ theme }) => theme.canvas.backgroundColor};
`;

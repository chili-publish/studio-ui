import styled from 'styled-components';

export const MainContentContainer = styled.div`
    display: flex;
    height: calc(100vh - 4rem);
    width: 100%;
`;

export const CanvasContainer = styled.div`
    width: 100%;
`;

export const SuiCanvas = styled.div<{ hasAnimationTimeline?: boolean }>`
    height: ${({ hasAnimationTimeline }) => (hasAnimationTimeline ? 'calc(100% - 5rem)' : '100%')};
    width: 100%;
`;

import styled from 'styled-components';

export const MainContentContainer = styled.div`
    display: flex;
    height: calc(100vh - 4rem);
    width: 100%;
`;

export const CanvasContainer = styled.div`
    width: 100%;
`;

export const SuiCanvas = styled.div<{
    hasAnimationTimeline?: boolean;
    hasMultiplePages?: boolean;
    isVisible?: boolean;
    isBottomBarHidden?: boolean;
}>`
    height: ${({ hasAnimationTimeline, hasMultiplePages, isBottomBarHidden }) => {
        if (hasAnimationTimeline && !isBottomBarHidden) {
            return 'calc(100% - 5rem)';
        }
        if (hasMultiplePages && !isBottomBarHidden) {
            return 'calc(100% - 7.5rem)';
        }
        return '100%';
    }};
    width: 100%;
    visibility: ${(props) => (props.isVisible ? 'visible' : 'hidden')};
`;

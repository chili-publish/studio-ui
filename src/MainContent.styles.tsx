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
}>`
    height: ${({ hasAnimationTimeline, hasMultiplePages }) => {
        if (hasAnimationTimeline) {
            return 'calc(100% - 5rem)';
        }
        if (hasMultiplePages) {
            return 'calc(100% - 7.5rem)';
        }
        return '100%';
    }};
    width: 100%;
    display: ${(props) => (props.isVisible ? 'block' : 'none')};
`;

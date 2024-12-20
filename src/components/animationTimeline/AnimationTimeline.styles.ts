import styled from 'styled-components';

export const AnimationTimelineWrapper = styled.div`
    box-sizing: border-box;
    padding: 1rem;
    height: 5rem;
    background: ${({ theme }) => theme.timeline.wrapper.backgroundColor};
    border-top: 2px solid ${({ theme }) => theme.panel.borderColor};
    // This was added as a workaround because the global style in grafx platform (box-sizing: border-box;)
    // Affects the box-sizing of the icons inside the play/pause button
    & svg {
        box-sizing: content-box !important;
    }
`;

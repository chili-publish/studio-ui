import { Colors } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const AnimationTimelineWrapper = styled.div`
    box-sizing: border-box;
    padding: 1rem;
    height: 5rem;
    background: ${Colors.PRIMARY_WHITE};
    // This was added as a workaround because the global style in grafx platform (box-sizing: border-box;)
    // Affects the box-sizing of the icons inside the play/pause button
    & svg {
        box-sizing: content-box !important;
    }
`;

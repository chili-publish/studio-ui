import { ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const AnimationTimelineWrapper = styled.div<{ themeStyles: ITheme }>`
    box-sizing: border-box;
    padding: 1rem;
    height: 5rem;
    background: ${({ themeStyles }) => themeStyles.timeline.wrapper.backgroundColor};
    border-top: 2px solid ${({ themeStyles }) => themeStyles.panel.borderColor};
    // This was added as a workaround because the global style in grafx platform (box-sizing: border-box;)
    // Affects the box-sizing of the icons inside the play/pause button
    & svg {
        box-sizing: content-box !important;
    }
`;

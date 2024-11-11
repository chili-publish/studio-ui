import { FontSizes, ITheme, ThemeColors } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const Text = styled.span<{ mode: ITheme['mode'] }>`
    font-size: ${FontSizes.regular};
    color: ${({ mode }) => ThemeColors[mode || 'light'].SECONDARY_TEXT};
`;

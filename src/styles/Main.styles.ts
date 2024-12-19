import { FontSizes, ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const Text = styled.span<{ themeColors: ITheme['themeColors'] }>`
    font-size: ${FontSizes.regular};
    color: ${({ themeColors }) => themeColors.secondaryFontText};
`;

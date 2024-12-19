import { ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const ErrorMessage = styled.span<{ themeColors: ITheme['themeColors'] }>`
    color: ${({ themeColors }) => themeColors.errorColor};
    font-size: 0.75rem;
    margin-top: 0.5rem;
`;

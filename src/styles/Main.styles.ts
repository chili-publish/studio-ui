import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const Text = styled.span`
    font-size: ${FontSizes.regular};
    color: ${({ theme }) => theme?.themeColors?.secondaryTextColor};
`;

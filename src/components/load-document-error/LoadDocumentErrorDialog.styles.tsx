import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const TitleWrapper = styled.div`
    font-size: 1.25rem;
`;

export const MessageWrapper = styled.div`
    color: ${({ theme }) => theme.themeColors.secondaryTextColor};
    font-size: ${FontSizes.regular};
    margin: 0 auto;
`;

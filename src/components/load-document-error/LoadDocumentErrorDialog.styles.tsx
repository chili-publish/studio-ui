import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const MessageWrapper = styled.div`
    color: ${({ theme }) => theme.themeColors.secondaryTextColor};
    font-size: ${FontSizes.regular};
    margin: 0 auto;
`;

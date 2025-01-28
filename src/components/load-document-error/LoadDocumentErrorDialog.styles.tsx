import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const MessageWrapper = styled.div`
    color: ${({ theme }) => theme.themeColors.secondaryTextColor};
    font-size: ${FontSizes.small};
    margin: 0 auto;
`;

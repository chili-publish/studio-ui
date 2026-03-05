import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

const Center = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const FullSizeCenter = styled(Center)`
    height: 100%;
`;

const Text = styled.span`
    font-size: ${FontSizes.small};
`;

export const EmptyStateText = styled(Text)`
    color: ${({ theme }) => theme.themeColors.secondaryTextColor};
`;

export const ErrorTextMsg = styled(Text)``;

export const ErrorTextBox = styled.div`
    color: ${({ theme }) => theme.themeColors.errorColor};
    display: flex;
    align-items: center;

    svg,
    svg:hover {
        color: ${({ theme }) => theme.themeColors.errorColor} !important;
    }

    ${ErrorTextMsg} {
        margin-inline-start: 0.313rem;
    }
`;

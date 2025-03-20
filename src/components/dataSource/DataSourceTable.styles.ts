import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const TableWrapper = styled.div`
    width: 100%;
    display: contents;
    // Although it states for margin-bottom, actually it implies on the right gap between table and right side of modal
    margin-bottom: 2.5rem;
    position: relative;
    table {
        margin-bottom: 2.5rem;
    }
`;

export const LoadingWrapper = styled.div`
    position: absolute;
    bottom: 2.5rem;
    width: 100%;
`;

export const Center = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    ${TableWrapper} + & {
        margin-top: -2rem;
    }
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
        margin-left: 0.313rem;
    }
`;

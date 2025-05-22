import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const TableWrapper = styled.div`
    width: 100%;
    display: contents;
    // Although it states for margin-bottom, actually it implies on the right gap between table and right side of modal
    margin-bottom: 2.5rem;
    position: relative;
    table {
        margin-bottom: 2rem; // 0.5rem takes InfiniteScrollingContainer
    }
`;

export const InfiniteScrollingContainer = styled.div`
    border-top: 1px solid transparent;
    boder-bottom: 1px solid transparent;
    // 2px is bottom size
    margin-bottom: calc(0.5rem - 2px);
`;

export const Center = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    ${TableWrapper} + & {
        margin-top: -2rem;
    }
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
        margin-left: 0.313rem;
    }
`;

import { FontSizes, ITheme, ThemeColors } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

// TODO: Replace with ThemeColors[mode].ERROR after https://chilipublishintranet.atlassian.net/browse/WRS-1347
function getErrorColor(mode: ITheme['mode']) {
    return mode === 'light' ? '#d31510' : '#ff816b';
}

export const TableWrapper = styled.div`
    width: 100%;
    display: contents;
    // Although it states for margin-bottom, actually it implies on the right gap between table and right side of modal
    margin-bottom: 2.5rem;

    table {
        margin-bottom: 2.5rem;
    }
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

export const EmptyStateText = styled(Text)<{ mode: ITheme['mode'] }>`
    color: ${({ mode }) => ThemeColors[mode || 'light'].SECONDARY_TEXT};
`;

export const ErrorTextMsg = styled(Text)<{ mode: ITheme['mode'] }>``;

export const ErrorTextBox = styled.div<{ mode: ITheme['mode'] }>`
    color: ${({ mode }) => getErrorColor(mode)};
    display: flex;
    align-items: center;

    svg,
    svg:hover {
        color: ${({ mode }) => getErrorColor(mode)} !important;
    }

    ${ErrorTextMsg} {
        margin-left: 0.313rem;
    }
`;

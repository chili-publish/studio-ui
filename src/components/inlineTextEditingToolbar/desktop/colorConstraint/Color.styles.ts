import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const ColorContainer = styled.div`
    width: 2.5rem;
    min-width: 2.5rem !important;
    height: 2.5rem;
    border-radius: 4px;
    background-color: ${({ color }) => color ?? 'transparent'};
    cursor: pointer;
`;

export const SelectColorLabel = styled.span`
    font-size: ${FontSizes.label};
    line-height: 1.5;
    color: ${({ theme }) => theme.themeColors.secondaryTextColor};
    display: flex;
    justify-content: center;
    padding: 1.5rem 0 0.25rem 0;
`;

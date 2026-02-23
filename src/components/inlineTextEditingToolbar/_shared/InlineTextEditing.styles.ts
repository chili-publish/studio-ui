import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const SelectColorLabel = styled.span`
    font-size: ${FontSizes.label};
    line-height: 1.5;
    color: ${({ theme }) => theme.themeColors.secondaryTextColor};
    display: flex;
    justify-content: center;
    padding: 1.5rem 0 0.25rem 0;
`;

export const StyledColorGrid = styled.div`
    [data-id='gsc-color-grid'] {
        min-height: auto !important;
    }
`;

import { Colors, FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const EditButtonWrapper = styled.div`
    position: fixed;
    left: 2rem;
    bottom: 6.5rem;
`;

export const VariablesPanelTitle = styled.h2`
    font-size: ${FontSizes.heading2};
    font-weight: 500;
    color: ${Colors.PRIMARY_FONT};
`;

export const ComponentWrapper = styled.div`
    margin-bottom: 1rem;
`;

export const VariablesListWrapper = styled.div<{ optionsListOpen?: boolean }>`
    ${(props) => props.optionsListOpen && 'margin: 0 -1.25rem -3rem -1.25rem'};
`;

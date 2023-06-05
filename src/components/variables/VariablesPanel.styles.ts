import { Colors, FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const EditButtonWrapper = styled.div`
    position: fixed;
    left: 2rem;
    bottom: 6.5rem;
`;

export const VariablesPanelHeader = styled.div`
    height: 3.5rem;
    display: flex;
    align-items: center;
    color: ${Colors.PRIMARY_FONT};
    font-size: ${FontSizes.heading2};
    font-weight: 500;
`;

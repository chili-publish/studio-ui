import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const PanelTitle = styled.h2<{ margin?: string }>`
    font-size: ${FontSizes.header};
    font-weight: 500;
    ${(props) => props.margin && `margin: ${props.margin};`};
    color: ${({ theme }) => theme.panel.color};
`;

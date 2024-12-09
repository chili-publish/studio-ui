import { FontSizes, ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const PanelTitle = styled.h2<{ margin?: string; panelTheme: ITheme['panel'] }>`
    font-size: ${FontSizes.header};
    font-weight: 500;
    ${(props) => props.margin && `margin: ${props.margin};`};
    color: ${(props) => props.panelTheme.color};
`;

import { ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';
import { BORDER_SIZE, SCROLL_SIZE } from '../../../utils/constants';

export const LeftPanelContainer = styled.div<{ overflowScroll: boolean; panelTheme: ITheme['panel'] }>`
    min-width: 18.75rem;
    width: 18.75rem;
    background-color: ${(props) => props.panelTheme.backgroundColor};
    border-right: 2px solid ${(props) => props.panelTheme.borderColor};
    padding-left: 0;
    scollbar-gutter: stable;
`;

export const VariablesListContainer = styled.div<{ hidden: boolean }>`
    padding: 0 0 0 1.25rem;
    box-sizing: border-box;
    width: calc(18.75rem - 1.5625rem - ${SCROLL_SIZE} + 1.25rem);
    ${({ hidden }) => hidden && 'display: none;'};
`;

export const ImagePanelContainer = styled.div<{ hidden: boolean }>`
    padding: 0 0 0 1.25rem;
    height: calc(100% - ${BORDER_SIZE});
    width: calc(18.75rem - ${BORDER_SIZE});
    ${({ hidden }) => hidden && 'display: none;'};
`;

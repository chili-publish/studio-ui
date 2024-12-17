import { ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';
import { SCROLL_SIZE } from '../../../utils/constants';

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
    width: calc(18.75rem - 1.5625rem - ${SCROLL_SIZE});
    ${({ hidden }) => hidden && 'display: none;'};
`;

export const ImagePanelContainer = styled.div<{ hidden: boolean }>`
    padding: 0 0 0 1.25rem;
    height: 100%;
    width: calc(18.75rem - 1.25rem - ${SCROLL_SIZE});
    ${({ hidden }) => hidden && 'display: none;'};
`;

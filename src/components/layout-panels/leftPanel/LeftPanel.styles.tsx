import { ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const LeftPanelContainer = styled.div<{ overflowScroll: boolean; panelTheme: ITheme['panel'] }>`
    min-width: 18.75rem;
    width: 18.75rem;
    background-color: ${(props) => props.panelTheme.backgroundColor};
    border-right: 2px solid ${(props) => props.panelTheme.borderColor};
    ${(props) => props.overflowScroll && 'overflow: scroll'};
    padding-left: 0;

    &::-webkit-scrollbar {
        width: 0;
    }
`;

export const VariablesListContainer = styled.div<{ hidden: boolean }>`
    padding: 0 1.25rem;
    ${({ hidden }) => hidden && 'display: none;'};
`;

export const ImagePanelContainer = styled.div<{ hidden: boolean }>`
    padding: 0 0 0 1.25rem;
    height: 100%;
    ${({ hidden }) => hidden && 'display: none;'};
`;

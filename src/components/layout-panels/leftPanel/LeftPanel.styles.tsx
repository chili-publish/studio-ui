import { Colors } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const LeftPanelContainer = styled.div<{ overflowScroll: boolean }>`
    min-width: 18.75rem;
    width: 18.75rem;
    background-color: ${Colors.PRIMARY_WHITE};
    border-right: 2px solid ${Colors.PRIMARY_DROPDOWN_BACKGROUND};
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

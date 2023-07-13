import { Colors } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const LeftPanelContainer = styled.div`
    min-width: 18.75rem;
    width: 18.75rem;
    background-color: ${Colors.PRIMARY_WHITE};
    overflow: scroll;
    margin-bottom: 3rem;
    padding-left: 0;

    &::-webkit-scrollbar {
        width: 0;
    }
`;

export const VariablesListContainer = styled.div`
    padding: 0 1.25rem;
`;

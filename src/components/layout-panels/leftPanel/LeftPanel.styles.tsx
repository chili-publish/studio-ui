import styled from 'styled-components';
import { Colors } from '../../../styles/vars/Colors';

export const LeftPanelContainer = styled.div`
    min-width: 18.75rem;
    width: 18.75rem;
    background-color: ${Colors.PRIMARY_WHITE}};
    overflow: scroll;

    &::-webkit-scrollbar {
        width: 0;
    }
`;

export const VariablesListContainer = styled.div`
    padding: 0 1.25rem;
`;

import styled from 'styled-components';
import { Colors } from '../../../styles/vars/Colors';
import FontSizes from '../../../styles/vars/FontSizes';

export const LeftPanelContainer = styled.div`
    width: 18.75rem;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    background-color: ${Colors.PRIMARY_WHITE}};
`;

export const LeftPanelHeader = styled.div`
    padding-top: 0.6875rem;
`;

export const LeftPanelContent = styled.div`
    background-color: lightblue;
    height: 100%;
    overflow-y: scroll;

    &::-webkit-scrollbar {
        width: 0;
    }
`;

export const FirstRow = styled.div`
    display: flex;
    align-items: center;
    padding-left: 0.5rem;
    color: ${Colors.PRIMARY_FONT};
    font-weight: ${FontSizes.heading2};
`;

export const SecondRow = styled.div`
    background-color: lightpink;
`;

export const HeaderText = styled.div`
    font-size: ${FontSizes.heading2};
    font-weight: 500;
    color: ${Colors.PRIMARY_FONT};
`;

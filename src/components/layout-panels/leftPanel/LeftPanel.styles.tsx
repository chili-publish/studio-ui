import styled from 'styled-components';
import { Colors } from '../../../styles/vars/Colors';
import FontSizes from '../../../styles/vars/FontSizes';

export const LeftPanelContainer = styled.div`
    width: 18.75rem;
    position: absolute;
    top: 4rem;
    left: 0;
    bottom: 0;
    background-color: ${Colors.PRIMARY_WHITE}};
`;

export const LeftPanelHeader = styled.div`
    padding-top: 0.6875rem;
`;

export const LeftPanelContent = styled.div`
    overflow-y: scroll;
    height: calc(100vh - 9.7rem);

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
    height: 2.5rem;
    display: flex;
    align-items: center;
    padding-left: 1rem;
`;

export const HeaderText = styled.div`
    font-size: ${FontSizes.heading2};
    font-weight: 500;
    color: ${Colors.PRIMARY_FONT};
`;

export const FilenameSpan = styled.span<{ last: boolean }>`
    color: ${(props) => (props.last ? Colors.PRIMARY_FONT : Colors.SECONDARY_FONT)};
    font-weight: ${(props) => (props.last ? 'bold' : 'normal')};
    padding: 0 0.5rem;
`;

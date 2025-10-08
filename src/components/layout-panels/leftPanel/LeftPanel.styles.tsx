import styled from 'styled-components';
import { BORDER_SIZE, SCROLL_SIZE } from '../../../utils/constants';

export const LeftPanelWrapper = styled.div<{ overflowScroll: boolean }>`
    min-width: 18.75rem;
    width: 18.75rem;
    background-color: ${({ theme }) => theme.panel.backgroundColor};
    border-right: 2px solid ${({ theme }) => theme.panel.borderColor};
    padding-inline-start: 0;
    scollbar-gutter: stable;
`;

export const LeftPanelContainer = styled.div<{ isHidden: boolean }>`
    padding-block: 0;
    padding-inline: 1.25rem 0;
    box-sizing: border-box;
    width: calc(18.75rem - 1.5625rem - ${SCROLL_SIZE} + 1.25rem);
    display: ${(props) => (props.isHidden ? 'none' : 'block')};
`;

export const ImagePanelContainer = styled.div`
    padding-block: 0;
    padding-inline: 1.25rem 0;
    height: calc(100% - ${BORDER_SIZE});
    width: calc(18.75rem - ${BORDER_SIZE});
`;

import styled from 'styled-components';
import { BORDER_SIZE, PAGES_CONTAINER_HEIGHT, SCROLL_SIZE } from '../../utils/constants';

export const Container = styled.div<{ isMobileSize: boolean }>`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    max-width: ${({ isMobileSize }) => (!isMobileSize ? 'calc(100vw - 18.875rem)' : '100%')};
    height: ${PAGES_CONTAINER_HEIGHT};
    background: ${({ theme }) => theme.panel.backgroundColor};
    border-top: ${BORDER_SIZE} solid ${({ theme }) => theme.panel.borderColor};
`;

export const ScrollableContainer = styled.div<{ isMobileSize?: boolean }>`
    display: flex;
    height: calc(${PAGES_CONTAINER_HEIGHT} - ${SCROLL_SIZE} - ${BORDER_SIZE});
    align-items: center;
    width: auto;
    white-space: nowrap;
    padding: 0.5rem 0.625rem 0 0.625rem;
    scrollbar-gutter: stable;
`;
export const Card = styled.div<{ selected?: boolean }>`
    box-sizing: border-box;
    width: 5rem;
    height: 5rem;
    margin: 0 0.625rem;
    flex-shrink: 0;
    border-radius: 0.5rem;
    border: 1px solid
        ${({ selected, theme }) =>
            selected ? theme.previewCard.card.selected.borderColor : theme.previewCard.card.borderColor};
    background-color: ${({ theme }) => theme.canvas.backgroundColor};
    &:hover {
        border-color: ${({ theme }) => theme.previewCard.card.hover.borderColor};
    }
    [data-id^='gsc-preview-container-'] {
        border-radius: 0.5rem;
    }
`;
export const NumberBadge = styled.div`
    position: absolute;
    bottom: 0.315rem;
    left: 0.9375rem;
    width: 1.5rem;
    height: 1.5rem;
    background-color: rgba(37, 37, 37, 0.75);
    color: white;
    font-size: 0.75rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
`;
export const Wrapper = styled.div`
    position: relative;
    display: flex;
    justify-items: center;
`;

import { ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const Container = styled.div<{ themeStyles: ITheme }>`
    box-sizing: border-box;
    display: flex;
    overflow: hidden;
    white-space: nowrap;
    max-width: 100%;
    height: 7.5rem;

    background: ${({ themeStyles }) => themeStyles.timeline.wrapper.backgroundColor};
    border-top: 2px solid ${({ themeStyles }) => themeStyles.panel.borderColor};
`;
export const ScrollableContainer = styled.div<{ isMobileSize: boolean }>`
    display: flex;
    height: 100%;
    padding: 0 0.625rem;
    align-items: center;
    overflow-x: auto;
    white-space: nowrap;
    max-width: ${({ isMobileSize }) => (!isMobileSize ? 'calc(100vw - 18.75rem)' : '100%')};
    overflow-y: hidden;
    white-space: nowrap;
    scrollbar-width: thin;
`;
export const Card = styled.div<{ themeStyles: ITheme; selected?: boolean }>`
    box-sizing: border-box;
    width: 5rem;
    height: 5rem;
    margin: 0 0.625rem;
    flex-shrink: 0;
    border-radius: 0.5rem;
    border: 1px solid
        ${({ selected, themeStyles }) =>
            selected ? themeStyles.previewCard.card.selected.borderColor : themeStyles.previewCard.card.borderColor};
    background-color: ${({ themeStyles }) => themeStyles.canvas.backgroundColor};
    &:hover {
        border-color: ${({ themeStyles }) => themeStyles.previewCard.card.hover.borderColor};
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

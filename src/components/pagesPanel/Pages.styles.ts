import { ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

// export const PagesContainer = styled.div<{ themeStyles: ITheme }>`
//     box-sizing: border-box;
//     padding: 1.25rem;
//     height: 7.65rem;
//     background: ${({ themeStyles }) => themeStyles.timeline.wrapper.backgroundColor};
//     border-top: 2px solid ${({ themeStyles }) => themeStyles.panel.borderColor};
//     display: flex;
//     overflow-x: scroll;
// `;

// export const Container = styled.div<{ themeStyles: ITheme }>`
//     background: ${({ themeStyles }) => themeStyles.timeline.wrapper.backgroundColor};
//     padding: 1.25rem;
//     width: 100%;
//     display: flex;
// `;

// export const CardContainer = styled.div<{ themeStyles: ITheme; selected?: boolean }>`
//     box-sizing: border-box;
//     width: 5rem;
//     height: 5rem;
//     margin: 0 1.25rem 0 0;
//     background: ${({ themeStyles }) => themeStyles.previewCard.card.backgroundColor};
//     border: 1px solid ${({ selected }) => (selected ? '#2c2c2c' : '#e7e7e7')};
//     border-radius: 0.5rem;
//     flex-shrink: 0;
// `;
export const ScrollableContainer = styled.div`
    display: flex;
    height: 100%;
    padding: 0 0.625rem;
    align-items: center;
    overflow-x: auto;
    white-space: nowrap;
    max-width: 100%;
    overflow-y: hidden; /* Restrict vertical overflow */
    white-space: nowrap;
    scrollbar-width: thin; /* For Firefox */
    scrollbar-color: #ccc transparent;

    &::-webkit-scrollbar {
        height: 8px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }
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
    background-color: ${({ themeStyles }) => themeStyles.previewCard.card.backgroundColor};
    &:hover {
        border-color: ${({ themeStyles }) => themeStyles.previewCard.card.hover.borderColor};
    }
    > section > div > section > div > img {
        border-radius: 0.5rem;
    }
`;

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

import { Colors, FontSizes, ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const EditButtonWrapper = styled.div<{ isTimelineDisplayed?: boolean; isPagesPanelDisplayed?: boolean }>`
    position: fixed;
    left: 1rem;
    bottom: ${({ isTimelineDisplayed, isPagesPanelDisplayed }) => {
        if (isTimelineDisplayed) return '6.5rem';
        if (isPagesPanelDisplayed) return '8.5rem';
        return '2.5rem';
    }};
`;

export const VariablesContainer = styled.div<{ height?: string }>`
    position: relative;
    height: ${(props) => props.height ?? '100%'};
`;
export const TrayPanelTitle = styled.h2<{ margin?: string; panelTheme: ITheme['panel'] }>`
    font-size: ${FontSizes.header};
    font-weight: 500;
    ${(props) => props.margin && `margin: ${props.margin};`};
    color: ${(props) => props.panelTheme.color};
`;

export const ComponentWrapper = styled.div`
    margin-bottom: 1rem;
`;

export const VariablesListWrapper = styled.div<{ optionsListOpen?: boolean }>`
    ${(props) => props.optionsListOpen && 'margin: 0 -1.25rem -3rem -1.25rem'};
`;

export const DatePickerTrayTitle = styled.div<{ themeMode: ITheme['mode'] }>`
    display: flex;
    justify-content: center;
    align-items: center;

    svg {
        ${({ themeMode }) => themeMode === 'light' && `color: ${Colors.PRIMARY_FONT} !important`};
    }
`;

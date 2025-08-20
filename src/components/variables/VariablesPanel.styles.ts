import { FontSizes } from '@chili-publish/grafx-shared-components';
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
export const TrayPanelTitle = styled.h2<{ margin?: string }>`
    font-size: ${FontSizes.header};
    font-weight: 500;
    ${(props) => props.margin && `margin: ${props.margin};`};
    color: ${(props) => props.theme.panel.color};

    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-break: break-word;
`;

export const ComponentWrapper = styled.div`
    margin-bottom: 1rem;
`;

export const TrayTitleWithBtn = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    svg {
        ${({ theme }) => theme.mode === 'light' && `color: ${theme.themeColors.primaryTextColor} !important`};
    }
`;

import { FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const DropdownContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

export const MobileDropdownValue = styled.div`
    display: inline-block;
    gap: 0.5rem;
    justify-content: space-between;
    align-items: center;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
`;

export const MobilePlaceholderWrapper = styled.span`
    color: ${(props) => props.theme.themeColors.placeholderTextColor};
    font-style: italic;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
`;

export const MobileDropdownOptionContainer = styled.div<{
    hasError?: boolean;
}>`
    display: flex;
    padding: 0 0.75rem;
    justify-content: space-between;
    align-items: center;
    background-color: ${({ theme }) => theme.select.control.backgroundColor};
    border: ${(props) =>
        props.hasError ? `1px solid ${props.theme.themeColors.errorColor}` : '1px solid transparent'};
    font-size: ${FontSizes.regular};
    line-height: 1.29;
    height: 2.5rem;
    border-radius: 0.25rem;
    &:hover {
        box-shadow: none;
        border-color: ${(props) =>
            props.hasError
                ? `1px solid ${props.theme.themeColors.errorColor}`
                : `1px solid ${props.theme.themeColors.inputFocusBorderColor}`};
        cursor: pointer;

        svg {
            color: ${(props) => props.theme.icon.hover.color};
        }
    }

    svg {
        color: ${({ theme }) => theme.select.color};
        min-width: 1.125rem;
    }
    ${MobileDropdownValue} {
        color: ${({ theme }) => theme.select.color};
    }
`;

export const MobileDropdownMenuOption = styled.div<{ selected?: boolean }>`
    display: flex;
    align-items: center;
    min-height: 3rem;
    word-break: break-word;
    padding: 0.5rem 0.75rem;
    font-size: ${FontSizes.regular};

    color: ${({ selected, theme }) => `${selected ? theme.select.color : theme.select.menuOption.color} !important`};

    svg {
        ${({ theme, selected }) => selected && `color: ${theme.select.color}`};
    }
    ${({ selected, theme }) => selected && `background-color: ${theme.select.menuOption.hover.backgroundColor};`};
    ${({ selected, theme }) => selected && `color: ${theme.select.menuOption.hover.color} !important;`};
`;

export const MobileDropdownOptionContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    > svg {
        width: ${FontSizes.icon} !important;
        min-width: ${FontSizes.icon} !important;
        height: ${FontSizes.icon} !important;
    }
`;

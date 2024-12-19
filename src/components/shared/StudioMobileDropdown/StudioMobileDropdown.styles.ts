import { FontSizes, ITheme } from '@chili-publish/grafx-shared-components';
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

export const MobilePlaceholderWrapper = styled.span<{
    themeColors: ITheme['themeColors'];
}>`
    color: ${(props) => props.themeColors.placeholderText};
    font-style: italic;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
`;

export const MobileDropdownOptionContainer = styled.div<{
    hasError?: boolean;
    iconStyles: ITheme['icon'];
    dropdownStyles: ITheme['dropdown'];
    themeColors: ITheme['themeColors'];
}>`
    display: flex;
    padding: 0 0.75rem;
    justify-content: space-between;
    align-items: center;
    background-color: ${({ dropdownStyles }) => dropdownStyles.control.backgroundColor};
    border: ${(props) => (props.hasError ? `1px solid ${props.themeColors.errorColor}` : '1px solid transparent')};
    font-size: ${FontSizes.regular};
    line-height: 1.29;
    height: 2.5rem;
    border-radius: 0.25rem;
    &:hover {
        box-shadow: none;
        border-color: ${(props) =>
            props.hasError
                ? `1px solid ${props.themeColors.errorColor}`
                : `1px solid ${props.themeColors.inputFocusBorder}`};
        cursor: pointer;

        svg {
            color: ${(props) => props.iconStyles.hover.color};
        }
    }

    svg {
        color: ${({ dropdownStyles }) => dropdownStyles.color};
        min-width: 1.125rem;
    }
    ${MobileDropdownValue} {
        color: ${({ dropdownStyles }) => dropdownStyles.color};
    }
`;

export const MobileDropdownMenuOption = styled.div<{ selected?: boolean; dropdownStyles: ITheme['dropdown'] }>`
    display: flex;
    align-items: center;
    min-height: 3rem;
    word-break: break-word;
    padding: 0.5rem 0.75rem;
    font-size: ${FontSizes.regular};

    color: ${({ selected, dropdownStyles }) =>
        `${selected ? dropdownStyles.color : dropdownStyles.menuOption.color} !important`};

    svg {
        ${({ dropdownStyles, selected }) => selected && `color: ${dropdownStyles.color}`};
    }
    ${({ selected, dropdownStyles }) =>
        selected && `background-color: ${dropdownStyles.menuOption.hover.backgroundColor};`};
    ${({ selected, dropdownStyles }) => selected && `color: ${dropdownStyles.menuOption.hover.color} !important;`};
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

import { Colors, FontSizes, ITheme } from '@chili-publish/grafx-shared-components';
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
    color: ${Colors.LIGHT_GRAY_600};
    font-style: italic;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
`;

export const MobileDropdownOptionContainer = styled.div<{ hasError?: boolean; dropdownStyles: ITheme['dropdown'] }>`
    display: flex;
    padding: 0 0.75rem;
    justify-content: space-between;
    align-items: center;
    background-color: ${({ dropdownStyles }) => dropdownStyles.control.backgroundColor};
    border: ${(props) => (props.hasError ? `1px solid ${Colors.RED_WARNING}` : '1px solid transparent')};
    font-size: ${FontSizes.regular};
    line-height: 1.29;
    height: 2.5rem;
    border-radius: 0.25rem;
    &:hover {
        box-shadow: none;
        border-color: ${(props) =>
            props.hasError ? `1px solid ${Colors.RED_WARNING}` : `1px solid ${Colors.PRIMARY_FONT}`};
        cursor: pointer;

        svg {
            color: ${Colors.PRIMARY_FONT};
        }
    }

    svg {
        color: ${({ dropdownStyles }) => dropdownStyles.indicator.color};
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
    color: ${({ dropdownStyles }) => `${dropdownStyles.menuOption.color} !important`};

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

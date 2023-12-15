import { Colors, FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const DropdownContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;
export const MobileDropdownOptionContainer = styled.div`
    display: flex;
    padding: 0 0.75rem;
    justify-content: space-between;
    align-items: center;
    background-color: ${Colors.LIGHT_GRAY};
    border: 1px solid transparent;
    font-size: ${FontSizes.regular};
    line-height: 1.29;
    height: 2.5rem;
    border-radius: 0.25rem;
    &:hover {
        box-shadow: none;
        border-color: ${Colors.PRIMARY_FONT};
        cursor: pointer;

        svg {
            color: ${Colors.PRIMARY_FONT};
        }
    }

    svg {
        color: ${Colors.SECONDARY_FONT};
    }
`;

export const MobileDropdownMenuOption = styled.div<{ selected?: boolean }>`
    display: flex;
    align-items: center;
    height: 3rem;
    padding: 0 1rem;
    font-size: ${FontSizes.regular};
    ${({ selected }) => selected && `background-color: ${Colors.LIGHT_GRAY_200};`};
`;

export const MobileDropdownOptionContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

export const MobileDropdownValue = styled.div`
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    align-items: center;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
`;

export const Label = styled.div<{ marginBottom?: string }>`
    color: ${Colors.SECONDARY_FONT};
    font-size: ${FontSizes.label};
    line-height: 1.33;
    margin-bottom: ${(props) => props.marginBottom ?? '0'};
`;

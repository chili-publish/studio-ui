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
    height: 2.5rem;
    border-radius: 0.25rem;
`;

export const MobileDropdownMenuOption = styled.div<{ selected?: boolean }>`
    display: flex;
    align-items: center;
    height: 3rem;
    padding: 0 1rem;
    ${({ selected }) => selected && `background-color: ${Colors.LIGHT_GRAY_200};`};
`;

export const MobileDropdownOptionContent = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
`;

export const MobileDropdownValue = styled.div`
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    align-items: center;
`;

export const Label = styled.div<{ marginBottom?: string }>`
    color: ${Colors.SECONDARY_FONT};
    font-size: ${FontSizes.label};
    line-height: 1.33;
    margin-bottom: ${(props) => props.marginBottom ?? '0'};
`;

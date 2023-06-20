import { Colors, FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const DownloadPanelContainer = styled.div`
    background-color: ${Colors.LIGHT_GRAY_70};
    box-shadow: 0 0 1.5rem 0 rgba(39, 39, 39, 0.25);
    border: solid 1px #fff;
    border-radius: 0.25rem;
`;

export const DownloadDropdownContainer = styled.div<{ noPadding?: boolean }>`
    border-top: 1px solid ${Colors.LIGHT_GRAY_100};
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

export const DownloadDropdownTitle = styled.div`
    padding: 1rem 1.25rem 1rem;
    font-size: ${FontSizes.heading2};
    font-weight: bold;
    color: ${Colors.LIGHT_PRIMARY_WHITE};
    border-bottom: 1px solid ${Colors.LIGHT_GRAY_100};
`;

export const DesktopDropdownContainer = styled.div`
    padding: 0 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;
export const DropdownLabel = styled.span`
    font-size: ${FontSizes.label};
    color: ${Colors.DARK_GRAY_500};
    padding-top: 1rem;
`;

export const DropdownOptionLabel = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
`;

export const DropdownOptionText = styled.span`
    font-size: ${FontSizes.regular};
    color: ${Colors.LIGHT_PRIMARY_WHITE};
`;

export const MobileDropdownContainer = styled.div`
    display: flex;
    padding: 0 0.75rem;
    margin-bottom: 1rem;
    justify-content: space-between;
    align-items: center;
    background-color: ${Colors.LIGHT_GRAY};
    height: 2.5rem;
    border-radius: 0.25rem;
`;

export const MobileDropdownLeftContent = styled.div`
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    align-items: center;
`;

export const MobileDropdownOption = styled.div<{ selected?: boolean }>`
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

export const TrayContentContainer = styled.div`
    padding-top: 1rem;
`;

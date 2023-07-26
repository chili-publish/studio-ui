import { Colors, FontSizes } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const DownloadPanelContainer = styled.div`
    background-color: ${Colors.LIGHT_GRAY_70};
    box-shadow: 0 0 1.5rem 0 rgba(39, 39, 39, 0.25);
    border: solid 1px ${Colors.PRIMARY_WHITE};
    border-radius: 0.25rem;
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

export const ButtonWrapper = styled.div`
    margin-top: 1rem;
`;

export const Content = styled.div<{ borderTop?: boolean }>`
    padding-top: 1rem;
    border-top: ${(props) => (props.borderTop ? `1px solid ${Colors.LIGHT_GRAY_100}` : 'none')};
`;

export const ExperimentalPill = styled.span`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: ${FontSizes.small};
    color: ${Colors.LIGHT_PRIMARY_WHITE};
    border: 1px solid ${Colors.LIGHT_PRIMARY_WHITE};
    border-radius: 5rem;
    height: 1.375rem;
    margin: 0 0.5rem;
    padding: 0 0.75rem;
`;

import { Colors, FontSizes, ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const DownloadDropdownTitle = styled.div`
    padding: 1rem 1.25rem 1rem;
    font-weight: bold;
    color: ${Colors.PRIMARY_FONT};
`;

export const DownloadPanelContainer = styled.div<{ styles: ITheme['panel'] }>`
    background-color: ${({ styles }) => styles.backgroundColor};
    box-shadow: 0 0 1.5rem 0 rgba(39, 39, 39, 0.25);
    border: solid 1px ${({ styles }) => styles.borderColor};
    border-radius: 0.25rem;
    ${DownloadDropdownTitle} {
        color: ${({ styles }) => styles.color};
        border-bottom: 1px solid ${({ styles }) => styles.borderColor};
        font-size: ${({ styles }) => styles.title.fontSize};
    }
`;

export const DesktopDropdownContainer = styled.div`
    padding: 0 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
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
    overflow: hidden;
    margin-right: 0.25rem;
    flex: 1;
`;

export const DropdownOptionText = styled.span`
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const DropdownOptionDescription = styled.span`
    font-size: ${FontSizes.label};
    color: ${Colors.DARK_GRAY_500};
    font-weight: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const Container = styled.div<{ dropdownStyles: ITheme['select'] }>`
    display: flex;
    flex: 1;
    flex-direction: column;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    ${DropdownOptionText} {
        font-size: ${({ dropdownStyles }) => `${dropdownStyles.fontSize}`};
        color: ${({ dropdownStyles }) => `${dropdownStyles.menuOption.color} !important`};
    }
    ${DropdownOptionDescription} {
        font-size: ${({ dropdownStyles }) => `${dropdownStyles.optionInfoFontSize}`};
    }
`;

export const ButtonWrapper = styled.div`
    margin-top: 1rem;
`;

export const Content = styled.div<{ borderTop?: boolean; panel: ITheme['panel'] }>`
    padding-top: 1rem;
    border-top: ${({ borderTop, panel }) => (borderTop ? `1px solid ${panel.borderColor}` : 'none')};
`;

export const ExperimentalPill = styled.span`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: ${FontSizes.small};
    color: ${Colors.PRIMARY_FONT};
    border: 1px solid ${Colors.PRIMARY_FONT};
    border-radius: 5rem;
    height: 1.375rem;
    margin: 0 0.5rem;
    padding: 0 0.75rem;
`;

export const BtnContainer = styled.div<{ mobile?: boolean }>`
    padding: ${(props) => (props.mobile ? '0' : '0 1.25rem;')};
`;
export const SpinnerContainer = styled(BtnContainer)`
    margin: ${(props) => (props.mobile ? 'auto' : '1.25rem auto 1.25rem;')};
    padding: ${(props) => (props.mobile ? '0' : '0 1.25rem;')};
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const LoadPageContainer = styled.div`
    margin: 2.5rem 0;
`;
export const LoadingIndicatorContainer = styled.div`
    display: flex;
    justify-content: center;
    color: ${Colors.SECONDARY_FONT};
    font-size: ${FontSizes.regular};
`;
export const Text = styled.span<{ color?: string }>`
    color: ${(props) => props.color ?? Colors.SECONDARY_FONT};
`;

export const ErrorToastWrapper = styled.div`
    & > div {
        left: 50%;
        top: 0;
        z-index: 2;
    }
`;

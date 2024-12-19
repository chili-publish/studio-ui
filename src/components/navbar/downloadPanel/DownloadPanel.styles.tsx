import { FontSizes, ITheme } from '@chili-publish/grafx-shared-components';
import styled from 'styled-components';

export const DownloadDropdownTitle = styled.div<{ themeColors: ITheme['themeColors'] }>`
    padding: 1rem 1.25rem 1rem;
    font-weight: bold;
    color: ${({ themeColors }) => themeColors.primaryFontText};
`;

export const DownloadPanelContainer = styled.div<{ panelStyles: ITheme['panel'] }>`
    background-color: ${({ panelStyles }) => panelStyles.backgroundColor};
    box-shadow: 0 0 1.5rem 0 rgba(39, 39, 39, 0.25);
    border: solid 1px ${({ panelStyles }) => panelStyles.borderColor};
    border-radius: 0.25rem;
    ${DownloadDropdownTitle} {
        color: ${({ panelStyles }) => panelStyles.color};
        border-bottom: 1px solid ${({ panelStyles }) => panelStyles.borderColor};
        font-size: ${({ panelStyles }) => panelStyles.title.fontSize};
    }
`;

export const DesktopDropdownContainer = styled.div`
    padding: 0 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
`;

export const DropdownOptionDescription = styled.span`
    font-size: ${FontSizes.label};
    font-weight: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const ExperimentalPill = styled.span`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: ${FontSizes.small};

    border-radius: 5rem;
    height: 1.375rem;
    margin: 0 0.5rem;
    padding: 0 0.75rem;
`;

export const DropdownOptionLabel = styled.div<{ themeColors: ITheme['themeColors'] }>`
    display: flex;
    gap: 0.5rem;
    align-items: center;
    overflow: hidden;
    margin-right: 0.25rem;
    flex: 1;
    ${DropdownOptionDescription} {
        color: ${({ themeColors }) => themeColors.secondaryFontText};
    }
    ${ExperimentalPill} {
        color: ${({ themeColors }) => themeColors.primaryFontText};
        border: 1px solid ${({ themeColors }) => themeColors.primaryFontText};
    }
`;

export const DropdownOptionText = styled.span`
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const Container = styled.div<{ dropdownStyles: ITheme['dropdown'] }>`
    display: flex;
    flex: 1;
    flex-direction: column;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    ${DropdownOptionText} {
        font-size: ${({ dropdownStyles }) => `${dropdownStyles.fontSize}`};
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

export const ErrorToastWrapper = styled.div`
    & > div {
        left: 50%;
        top: 0;
        z-index: 2;
    }
`;

import {
    AvailableIcons,
    Button,
    ButtonVariant,
    Icon,
    Menu,
    Select,
    SelectOptions,
    Tray,
    useMobileSize,
    useTheme,
} from '@chili-publish/grafx-shared-components';
import { DownloadFormats, LayoutIntent } from '@chili-publish/studio-sdk';
import { Dispatch, useMemo, useState } from 'react';
import { css } from 'styled-components';
import { UserInterfaceOutputSettings } from '../../../types/types';
import { APP_WRAPPER_ID } from '../../../utils/constants';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import StudioMobileDropdown from '../../shared/StudioMobileDropdown/StudioMobileDropdown';
import {
    BtnContainer,
    ButtonWrapper,
    Content,
    DesktopDropdownContainer,
    DownloadDropdownTitle,
    DownloadPanelContainer,
    SpinnerContainer,
} from './DownloadPanel.styles';
import { outputTypesIcons } from './DownloadPanel.types';
import DropdownOption from './DropdownOption';
import useDownload from './useDownload';
import ExportModal from '../exportModal/ExportModal';

type SelectOptionType = SelectOptions & { item: UserInterfaceOutputSettings };

interface DownloadPanelProps {
    hideDownloadPanel: () => void;
    isDownloadPanelVisible: boolean;
    handleDownload: (
        _: DownloadFormats,
        __: Dispatch<Partial<Record<DownloadFormats, boolean>>>,
        outputSettingsId: string | undefined,
    ) => Promise<void>;
    isSandBoxMode?: boolean;
    layoutIntent?: LayoutIntent | null;
}

const getCustomSelectedLabel = (option: SelectOptions) => {
    const item = (option as SelectOptionType).item as UserInterfaceOutputSettings;
    const key = item.type.toLowerCase() as keyof typeof outputTypesIcons;
    return <DropdownOption iconData={outputTypesIcons[key]} text={item.name} description="" />;
};

const getCustomSelectedOption = (option: SelectOptions) => {
    return option ? ({ label: getCustomSelectedLabel(option), value: option.value } as SelectOptions) : undefined;
};
function DownloadPanel(props: DownloadPanelProps) {
    const { hideDownloadPanel, isDownloadPanelVisible, handleDownload, isSandBoxMode, layoutIntent } = props;

    const isMobileSize = useMobileSize();
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const { themeColors } = useTheme();
    const {
        downloadOptions,
        userInterfaceDownloadOptions,
        downloadPanelRef,
        downloadState,
        selectedOptionFormat,
        updateDownloadState,
        handleOutputFormatChange,
        selectedOutputSettingsId,
    } = useDownload(hideDownloadPanel);

    const selectedValue = useMemo(() => {
        if (userInterfaceDownloadOptions) {
            return (
                userInterfaceDownloadOptions.find((item) => item.value === selectedOutputSettingsId) ??
                userInterfaceDownloadOptions[0]
            );
        }
        return downloadOptions.find((item) => item.value === selectedOptionFormat) ?? downloadOptions[0];
    }, [downloadOptions, selectedOptionFormat, selectedOutputSettingsId, userInterfaceDownloadOptions]);

    return (
        <>
            <Tray
                isOpen={!!isMobileSize && isDownloadPanelVisible}
                anchorId={APP_WRAPPER_ID}
                close={() => {
                    hideDownloadPanel();
                    setMobileDropdownOpen(false);
                }}
                title={!mobileDropdownOpen && 'Download'}
                styles={css`
                    ${mobileDropdownOpen ? 'padding: 0;' : 'padding-bottom: 1rem;'}
                    overflow: hidden;
                `}
                hideCloseButton={mobileDropdownOpen}
            >
                <Content borderTop={!mobileDropdownOpen}>
                    <StudioMobileDropdown
                        dataId={getDataIdForSUI(`output-dropdown`)}
                        label="Output"
                        selectedValue={getCustomSelectedOption(selectedValue)}
                        options={userInterfaceDownloadOptions ?? downloadOptions}
                        onChange={(val) => handleOutputFormatChange(val as typeof selectedOptionFormat)}
                        onMenuOpen={() => setMobileDropdownOpen(true)}
                        onMenuClose={() => setMobileDropdownOpen(false)}
                    />
                </Content>
                {!mobileDropdownOpen ? (
                    <ButtonWrapper>
                        {downloadState[selectedOptionFormat] ? (
                            <SpinnerContainer mobile>
                                <Button
                                    loading
                                    styles={css`
                                        width: 100%;
                                        background-color: ${themeColors.disabledElementsColor};
                                        &:hover {
                                            background-color: ${themeColors.disabledElementsColor};
                                        }
                                    `}
                                />
                            </SpinnerContainer>
                        ) : (
                            <Button
                                dataId={getDataIdForSUI(`download-btn`)}
                                dataTestId={getDataTestIdForSUI(`download-btn`)}
                                onClick={() => {
                                    handleDownload(selectedOptionFormat, updateDownloadState, selectedOutputSettingsId);
                                }}
                                variant={ButtonVariant.primary}
                                label="Download"
                                icon={<Icon key={selectedOptionFormat} icon={AvailableIcons.faArrowDownToLine} />}
                                styles={css`
                                    width: 100%;
                                `}
                            />
                        )}
                    </ButtonWrapper>
                ) : null}
            </Tray>

            {isSandBoxMode ? (
                <ExportModal
                    isExportModalVisible={isDownloadPanelVisible}
                    hideExportModalVisible={hideDownloadPanel}
                    handleExport={handleDownload}
                    updateDownloadState={updateDownloadState}
                    downloadState={downloadState}
                    layoutIntent={layoutIntent}
                />
            ) : (
                <Menu
                    isVisible={!isMobileSize && isDownloadPanelVisible}
                    onClose={() => undefined}
                    position={{ right: 9.875 * 16, top: 3.75 * 16 } as unknown as DOMRect}
                    style={{ width: 19 * 16 - 3 }}
                    anchorId={APP_WRAPPER_ID}
                >
                    <DownloadPanelContainer ref={downloadPanelRef}>
                        <DownloadDropdownTitle>Download</DownloadDropdownTitle>
                        <DesktopDropdownContainer>
                            <Select
                                label="Output"
                                dataId={getDataIdForSUI(`output-dropdown`)}
                                dataTestId={getDataTestIdForSUI(`output-dropdown`)}
                                defaultValue={selectedValue}
                                options={userInterfaceDownloadOptions ?? downloadOptions}
                                isSearchable={false}
                                width="16.25rem"
                                onChange={(option) =>
                                    handleOutputFormatChange(option?.value as typeof selectedOptionFormat)
                                }
                                customValue={getCustomSelectedLabel}
                            />
                        </DesktopDropdownContainer>
                        {downloadState[selectedOptionFormat] ? (
                            <SpinnerContainer>
                                <Button
                                    loading
                                    styles={css`
                                        width: 100%;
                                        background-color: ${themeColors.disabledElementsColor};
                                        &:hover {
                                            background-color: ${themeColors.disabledElementsColor};
                                        }
                                    `}
                                />
                            </SpinnerContainer>
                        ) : (
                            <BtnContainer>
                                <Button
                                    dataId={getDataIdForSUI(`download-btn`)}
                                    dataTestId={getDataTestIdForSUI(`download-btn`)}
                                    dataIntercomId="Download selected output"
                                    onClick={() => {
                                        handleDownload(
                                            selectedOptionFormat,
                                            updateDownloadState,
                                            selectedOutputSettingsId,
                                        );
                                    }}
                                    variant={ButtonVariant.primary}
                                    label="Download"
                                    icon={<Icon key={selectedOptionFormat} icon={AvailableIcons.faArrowDownToLine} />}
                                    styles={css`
                                        margin: 1.25rem auto 1.25rem;
                                        width: 100%;
                                    `}
                                />
                            </BtnContainer>
                        )}
                    </DownloadPanelContainer>
                </Menu>
            )}
        </>
    );
}

export default DownloadPanel;

import {
    AvailableIcons,
    Button,
    ButtonVariant,
    Colors,
    DropDown,
    Icon,
    LoadingIcon,
    Menu,
    Tray,
    useMobileSize,
    useTheme,
} from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import { css } from 'styled-components';
import { Dispatch, useMemo, useState } from 'react';
import {
    ButtonWrapper,
    Content,
    DesktopDropdownContainer,
    DownloadDropdownTitle,
    DownloadPanelContainer,
    SpinnerContainer,
} from './DownloadPanel.styles';
import useDownload from './useDownload';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import StudioMobileDropdown from '../../shared/StudioMobileDropdown/StudioMobileDropdown';

interface DownloadPanelProps {
    hideDownloadPanel: () => void;
    isDownloadPanelVisible: boolean;
    handleDownload: (
        _: DownloadFormats,
        __: Dispatch<Partial<Record<DownloadFormats, boolean>>>,
        outputSettingsId: string | undefined,
    ) => Promise<void>;
}

function DownloadPanel(props: DownloadPanelProps) {
    const { hideDownloadPanel, isDownloadPanelVisible, handleDownload } = props;
    const isMobileSize = useMobileSize();
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const { panel } = useTheme();

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

    const getSelectedValue = useMemo(() => {
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
                        selectedValue={getSelectedValue}
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
                                <LoadingIcon color={Colors.PRIMARY_WHITE} />
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

            <Menu
                isVisible={!isMobileSize && isDownloadPanelVisible}
                onClose={() => undefined}
                position={{ right: 9.875 * 16, top: 3.75 * 16 } as unknown as DOMRect}
                style={{ width: 19 * 16 - 3 }}
            >
                <DownloadPanelContainer ref={downloadPanelRef} styles={panel}>
                    <DownloadDropdownTitle>Download</DownloadDropdownTitle>
                    <DesktopDropdownContainer>
                        <DropDown
                            label="Output"
                            dataId={getDataIdForSUI(`output-dropdown`)}
                            dataTestId={getDataTestIdForSUI(`output-dropdown`)}
                            defaultValue={getSelectedValue}
                            options={userInterfaceDownloadOptions ?? downloadOptions}
                            isSearchable={false}
                            width="16.25rem"
                            onChange={(option) =>
                                handleOutputFormatChange(option?.value as typeof selectedOptionFormat)
                            }
                        />
                    </DesktopDropdownContainer>
                    {downloadState[selectedOptionFormat] ? (
                        <SpinnerContainer>
                            <LoadingIcon color={Colors.PRIMARY_WHITE} />
                        </SpinnerContainer>
                    ) : (
                        <Button
                            dataId={getDataIdForSUI(`download-btn`)}
                            dataTestId={getDataTestIdForSUI(`download-btn`)}
                            dataIntercomId="Download selected output"
                            onClick={() => {
                                handleDownload(selectedOptionFormat, updateDownloadState, selectedOutputSettingsId);
                            }}
                            variant={ButtonVariant.primary}
                            label="Download"
                            icon={<Icon key={selectedOptionFormat} icon={AvailableIcons.faArrowDownToLine} />}
                            styles={css`
                                margin: 1.25rem auto 1.25rem;
                                width: 16.25rem;
                            `}
                        />
                    )}
                </DownloadPanelContainer>
            </Menu>
        </>
    );
}

export default DownloadPanel;

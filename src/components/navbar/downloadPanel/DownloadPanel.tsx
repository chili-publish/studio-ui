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
} from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import { css } from 'styled-components';
import { Dispatch, useMemo, useState } from 'react';
import StudioDropdown from '../../shared/StudioDropdown';
import {
    ButtonWrapper,
    Content,
    DesktopDropdownContainer,
    DownloadDropdownTitle,
    DownloadPanelContainer,
    DropdownLabel,
    SpinnerContainer,
} from './DownloadPanel.styles';
import useDownload from './useDownload';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';

interface DownloadPanelProps {
    hideDownloadPanel: () => void;
    isDownloadPanelVisible: boolean;
    handleDownload: (_: DownloadFormats, __: Dispatch<Partial<Record<DownloadFormats, boolean>>>) => Promise<void>;
}

function DownloadPanel(props: DownloadPanelProps) {
    const { hideDownloadPanel, isDownloadPanelVisible, handleDownload } = props;
    const isMobileSize = useMobileSize();
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

    const {
        downloadOptions,
        userInterfaceDownloadOptions,
        downloadPanelRef,
        downloadState,
        selectedOption,
        setSelectedOption,
        updateDownloadState,
    } = useDownload(hideDownloadPanel);

    const getSelectedValue = useMemo(() => {
        if (userInterfaceDownloadOptions) {
            return (
                userInterfaceDownloadOptions.find((item) => item.value === selectedOption) ??
                userInterfaceDownloadOptions[0]
            );
        }
        return downloadOptions.find((item) => item.value === selectedOption) ?? downloadOptions[0];
    }, [downloadOptions, selectedOption, userInterfaceDownloadOptions]);

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
                    <StudioDropdown
                        dataId={getDataIdForSUI(`output-dropdown`)}
                        label="Output"
                        selectedValue={getSelectedValue}
                        options={userInterfaceDownloadOptions ?? downloadOptions}
                        onChange={(val) => setSelectedOption(val as typeof selectedOption)}
                        onMenuOpen={() => setMobileDropdownOpen(true)}
                        onMenuClose={() => setMobileDropdownOpen(false)}
                    />
                </Content>
                {!mobileDropdownOpen ? (
                    <ButtonWrapper>
                        {downloadState[selectedOption] ? (
                            <SpinnerContainer mobile>
                                <LoadingIcon color={Colors.PRIMARY_WHITE} />
                            </SpinnerContainer>
                        ) : (
                            <Button
                                dataId={getDataIdForSUI(`download-btn`)}
                                dataTestId={getDataTestIdForSUI(`download-btn`)}
                                onClick={() => {
                                    handleDownload(selectedOption, updateDownloadState);
                                }}
                                variant={ButtonVariant.primary}
                                label="Download"
                                icon={<Icon key={selectedOption} icon={AvailableIcons.faArrowDownToLine} />}
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
                <DownloadPanelContainer ref={downloadPanelRef}>
                    <DownloadDropdownTitle>Download</DownloadDropdownTitle>
                    <DesktopDropdownContainer>
                        <DropdownLabel>Output</DropdownLabel>
                        <DropDown
                            dataId={getDataIdForSUI(`output-dropdown`)}
                            dataTestId={getDataTestIdForSUI(`output-dropdown`)}
                            defaultValue={getSelectedValue}
                            options={userInterfaceDownloadOptions ?? downloadOptions}
                            isSearchable={false}
                            width="16.25rem"
                            onChange={(option) => setSelectedOption(option?.value as typeof selectedOption)}
                        />
                    </DesktopDropdownContainer>
                    {downloadState[selectedOption] ? (
                        <SpinnerContainer>
                            <LoadingIcon color={Colors.PRIMARY_WHITE} />
                        </SpinnerContainer>
                    ) : (
                        <Button
                            dataId={getDataIdForSUI(`download-btn`)}
                            dataTestId={getDataTestIdForSUI(`download-btn`)}
                            dataIntercomId="Download selected output"
                            onClick={() => {
                                handleDownload(selectedOption, updateDownloadState);
                            }}
                            variant={ButtonVariant.primary}
                            label="Download"
                            icon={<Icon key={selectedOption} icon={AvailableIcons.faArrowDownToLine} />}
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

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
import { Dispatch, useState } from 'react';
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

interface DownloadPanelProps {
    hideDownloadPanel: () => void;
    isDownloadPanelVisible: boolean;
    handleDownload: (_: DownloadFormats, __: Dispatch<Partial<Record<DownloadFormats, boolean>>>) => Promise<void>;
}

function DownloadPanel(props: DownloadPanelProps) {
    const { hideDownloadPanel, isDownloadPanelVisible, handleDownload } = props;
    const isMobileSize = useMobileSize();
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

    const { downloadOptions, downloadPanelRef, downloadState, selectedOption, setSelectedOption, updateDownloadState } =
        useDownload(hideDownloadPanel);

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
                        id="output-type"
                        label="Output type"
                        selectedValue={downloadOptions.find((item) => item.value === selectedOption)}
                        options={downloadOptions}
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
                        <DropdownLabel>Output type</DropdownLabel>
                        <DropDown
                            defaultValue={downloadOptions.find((option) => option.value === selectedOption)}
                            options={downloadOptions}
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

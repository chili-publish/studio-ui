import {
    AvailableIcons,
    Button,
    ButtonVariant,
    DropDown,
    Icon,
    Menu,
    Option,
    Tray,
    useOnClickOutside,
} from '@chili-publish/grafx-shared-components';
import { useMemo, useRef, useState } from 'react';
import { css } from 'styled-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import {
    DesktopDropdownContainer,
    DownloadDropdownContainer,
    DownloadDropdownTitle,
    DownloadPanelContainer,
    DropdownLabel,
    MobileDropdownContainer,
    MobileDropdownLeftContent,
    MobileDropdownOption,
    MobileDropdownOptionContent,
    TrayContentContainer,
} from './DownloadPanel.styles';
import DropdownOption from './DropdownOption';
import useMobileSize from '../../../hooks/useMobileSize';

interface DownloadPanelProps {
    hideDownloadPanel: () => void;
    isDownloadPanelShown: boolean;
    handleDownload: (_: DownloadFormats) => Promise<void>;
}

function DownloadPanel(props: DownloadPanelProps) {
    const { hideDownloadPanel, isDownloadPanelShown, handleDownload } = props;
    const isMobileSize = useMobileSize();

    const [mobileDropdownPressed, setMobileDropdownPressed] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string>('jpg');

    const downloadPanelRef = useRef<HTMLDivElement | null>(null);
    useOnClickOutside(downloadPanelRef, hideDownloadPanel);

    const downloadOptions: Option[] = useMemo(
        () => [
            { label: <DropdownOption icon={AvailableIcons.faImage} text="JPG" />, value: DownloadFormats.JPG },
            { label: <DropdownOption icon={AvailableIcons.faImage} text="PNG" />, value: DownloadFormats.PNG },
            // { label: <DropdownOption icon={AvailableIcons.faImage} text="PDF print" />, value: DownloadFormats.PDF },
            { label: <DropdownOption icon={AvailableIcons.faFileVideo} text="MP4" />, value: DownloadFormats.MP4 },
            { label: <DropdownOption icon={AvailableIcons.faGif} text="GIF" />, value: DownloadFormats.GIF },
        ],
        [],
    );

    const trayContent = mobileDropdownPressed ? (
        <TrayContentContainer>
            {downloadOptions.map((option) => (
                <MobileDropdownOption
                    key={option.value}
                    selected={selectedOption === option.value}
                    onClick={() => {
                        setSelectedOption(option.value as string);
                        setMobileDropdownPressed(false);
                    }}
                >
                    <MobileDropdownOptionContent>
                        {option.label}
                        {selectedOption === option.value && <Icon icon={AvailableIcons.faCheck} />}
                    </MobileDropdownOptionContent>
                </MobileDropdownOption>
            ))}
        </TrayContentContainer>
    ) : (
        <>
            <DownloadDropdownContainer noPadding>
                <DropdownLabel>Output type</DropdownLabel>
                <MobileDropdownContainer onClick={() => setMobileDropdownPressed(true)}>
                    <MobileDropdownLeftContent>
                        {downloadOptions.find((option) => option.value === selectedOption)?.label}
                    </MobileDropdownLeftContent>
                    <Icon icon={AvailableIcons.faChevronDown} />
                </MobileDropdownContainer>
            </DownloadDropdownContainer>
            <Button
                onClick={() => {
                    handleDownload(selectedOption.toUpperCase() as DownloadFormats);
                }}
                variant={ButtonVariant.primary}
                label="Download"
                icon={<Icon icon={AvailableIcons.faArrowDownToLine} />}
                styles={css`
                    width: 100%;
                `}
            />
        </>
    );

    return (
        <>
            {!!isMobileSize && isDownloadPanelShown && (
                <Tray
                    isOpen={!!isMobileSize && isDownloadPanelShown}
                    close={() => {
                        hideDownloadPanel();
                        setMobileDropdownPressed(false);
                    }}
                    title={!mobileDropdownPressed && 'Download'}
                    styles={css`
                        ${mobileDropdownPressed ? 'padding: 0;' : 'padding-bottom: 1rem;'}
                        overflow: hidden;
                    `}
                    hideCloseButton={mobileDropdownPressed}
                >
                    {trayContent}
                </Tray>
            )}
            {!isMobileSize && isDownloadPanelShown && (
                <Menu
                    isVisible={!isMobileSize && isDownloadPanelShown}
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
                                onChange={(option) => setSelectedOption(option?.value as string)}
                            />
                        </DesktopDropdownContainer>
                        <Button
                            onClick={() => {
                                handleDownload(selectedOption as DownloadFormats);
                            }}
                            variant={ButtonVariant.primary}
                            label="Download"
                            icon={<Icon key={selectedOption} icon={AvailableIcons.faArrowDownToLine} />}
                            styles={css`
                                margin: 1.25rem auto 1.25rem;
                                width: 16.25rem;
                            `}
                        />
                    </DownloadPanelContainer>
                </Menu>
            )}
        </>
    );
}

export default DownloadPanel;

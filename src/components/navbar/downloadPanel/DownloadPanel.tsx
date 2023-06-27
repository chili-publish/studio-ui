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
    ButtonWrapper,
    Content,
    DesktopDropdownContainer,
    DownloadDropdownTitle,
    DownloadPanelContainer,
    DropdownLabel,
} from './DownloadPanel.styles';
import DropdownOption from './DropdownOption';
import useMobileSize from '../../../hooks/useMobileSize';
import StudioDropdown from '../../shared/StudioDropdown';

interface DownloadPanelProps {
    hideDownloadPanel: () => void;
    isDownloadPanelVisible: boolean;
    handleDownload: (_: DownloadFormats) => Promise<void>;
}

function DownloadPanel(props: DownloadPanelProps) {
    const { hideDownloadPanel, isDownloadPanelVisible, handleDownload } = props;
    const isMobileSize = useMobileSize();

    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string>('jpg');

    const downloadPanelRef = useRef<HTMLDivElement | null>(null);
    useOnClickOutside(downloadPanelRef, hideDownloadPanel);

    const downloadOptions: Option[] = useMemo(
        () => [
            { label: <DropdownOption icon={AvailableIcons.faImage} text="JPG" />, value: DownloadFormats.JPG },
            { label: <DropdownOption icon={AvailableIcons.faImage} text="PNG" />, value: DownloadFormats.PNG },
            { label: <DropdownOption icon={AvailableIcons.faFileVideo} text="MP4" />, value: DownloadFormats.MP4 },
            { label: <DropdownOption icon={AvailableIcons.faGif} text="GIF" />, value: DownloadFormats.GIF },
            {
                label: <DropdownOption icon={AvailableIcons.faFilePdf} text="PDF" isExperimental />,
                value: DownloadFormats.EXPERIMENTAL_PDF,
            },
        ],
        [],
    );

    const trayContent = (
        <>
            <Content borderTop={!mobileDropdownOpen}>
                <StudioDropdown
                    label="Output type"
                    selectedValue={downloadOptions.find((item) => item.value === selectedOption)}
                    options={downloadOptions}
                    onChange={(val) => setSelectedOption(val)}
                    onMenuOpen={() => setMobileDropdownOpen(true)}
                    onMenuClose={() => setMobileDropdownOpen(false)}
                />
            </Content>
            {!mobileDropdownOpen ? (
                <ButtonWrapper>
                    <Button
                        onClick={() => {
                            handleDownload(selectedOption as DownloadFormats);
                        }}
                        variant={ButtonVariant.primary}
                        label="Download"
                        icon={<Icon icon={AvailableIcons.faArrowDownToLine} />}
                        styles={css`
                            width: 100%;
                        `}
                    />
                </ButtonWrapper>
            ) : null}
        </>
    );

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
                {trayContent}
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
        </>
    );
}

export default DownloadPanel;

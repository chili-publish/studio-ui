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
import {
    DownloadDropdownContainer,
    DownloadDropdownLabel,
    DownloadDropdownTitle,
    DownloadPanelContainer,
    DropdownOptionText,
    MobileDropdownContainer,
    MobileDropdownLeftContent,
    MobileDropdownOption,
    MobileDropdownOptionContent,
} from './DownloadPanel.styles';
import DropdownOption from './DropdownOption';
import useMobileSize from '../../../hooks/useMobileSize';

interface DownloadPanelProps {
    hideDownloadPanel: () => void;
    isDownloadPanelShown: boolean;
}

function DownloadPanel(props: DownloadPanelProps) {
    const { hideDownloadPanel, isDownloadPanelShown } = props;
    const isMobileSize = useMobileSize();

    const [mobileDropdownPressed, setMobileDropdownPressed] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string>();

    const downloadPanelRef = useRef<HTMLDivElement | null>(null);
    useOnClickOutside(downloadPanelRef, hideDownloadPanel);

    const downloadOptions: Option[] = useMemo(
        () => [
            { label: <DropdownOption icon={AvailableIcons.faImage} text="JPG" />, value: 'jpg' },
            { label: <DropdownOption icon={AvailableIcons.faImage} text="PNG" />, value: 'png' },
            { label: <DropdownOption icon={AvailableIcons.faFileVideo} text="MP4" />, value: 'mp4' },
            { label: <DropdownOption icon={AvailableIcons.faGif} text="GIF" />, value: 'gif' },
        ],
        [],
    );

    const trayContent = mobileDropdownPressed ? (
        <div style={{ paddingTop: '1.25rem' }}>
            {downloadOptions.map((option) => (
                <MobileDropdownOption
                    key={option.value}
                    selected={selectedOption === option.value}
                    onClick={() => setSelectedOption(option.value as string)}
                >
                    <MobileDropdownOptionContent onClick={hideDownloadPanel}>
                        {option.label}
                        {selectedOption === option.value && <Icon icon={AvailableIcons.faCheck} />}
                    </MobileDropdownOptionContent>
                </MobileDropdownOption>
            ))}
        </div>
    ) : (
        <>
            <DownloadDropdownContainer onClick={() => setMobileDropdownPressed(true)}>
                <DownloadDropdownLabel>Output type</DownloadDropdownLabel>
                <MobileDropdownContainer>
                    <MobileDropdownLeftContent>
                        <Icon icon={AvailableIcons.faImage} />
                        <DropdownOptionText>PDF print</DropdownOptionText>
                    </MobileDropdownLeftContent>
                    <Icon icon={AvailableIcons.faChevronDown} />
                </MobileDropdownContainer>
            </DownloadDropdownContainer>
            <Button
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
            <Tray
                isOpen={!!isMobileSize && isDownloadPanelShown}
                close={hideDownloadPanel}
                title={!mobileDropdownPressed && 'Download'}
                onTrayHidden={() => setMobileDropdownPressed(false)}
                styles={css`
                    ${mobileDropdownPressed && 'padding: 0;'}
                    overflow: hidden;
                `}
                hideCloseButton={mobileDropdownPressed}
            >
                {trayContent}
            </Tray>
            <Menu
                isVisible={!isMobileSize && isDownloadPanelShown}
                onClose={() => undefined}
                position={{ right: 9.875 * 16, top: 3.75 * 16 } as unknown as DOMRect}
                style={{ width: 19 * 16 - 3 }}
            >
                <DownloadPanelContainer ref={downloadPanelRef}>
                    <DownloadDropdownTitle>Download</DownloadDropdownTitle>
                    <DownloadDropdownContainer>
                        <DownloadDropdownLabel>Output type</DownloadDropdownLabel>
                        <DropDown options={downloadOptions} isSearchable={false} width="16.25rem" />
                    </DownloadDropdownContainer>
                    <Button
                        variant={ButtonVariant.primary}
                        label="Download"
                        icon={<Icon icon={AvailableIcons.faArrowDownToLine} />}
                        styles={css`
                            width: 100%;
                            margin-bottom: 1.25rem;
                        `}
                    />
                </DownloadPanelContainer>
            </Menu>
        </>
    );
}

export default DownloadPanel;

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
import { useMemo, useRef } from 'react';
import { css } from 'styled-components';
import {
    DownloadDropdownContainer,
    DownloadDropdownLabel,
    DownloadDropdownTitle,
    DownloadPanelContainer,
    DropdownOptionText,
    MobileDropdownContainer,
    MobileDropdownLeftContent,
} from './DownloadPanel.styles';
import DropdownOption from './DropdownOption';
import useMobileSize from '../../../hooks/useMobileSize';

interface DownloadPanelProps {
    showDownloadPanel: boolean;
    toggleDownloadPanel: () => void;
}

function DownloadPanel(props: DownloadPanelProps) {
    const { toggleDownloadPanel, showDownloadPanel } = props;
    const isMobileSize = useMobileSize();

    const downloadPanelRef = useRef<HTMLDivElement | null>(null);
    useOnClickOutside(downloadPanelRef, toggleDownloadPanel);

    const downloadOptions: Option[] = useMemo(
        () => [
            { label: <DropdownOption icon={AvailableIcons.faImage} text="JPG" />, value: 'jpg' },
            { label: <DropdownOption icon={AvailableIcons.faImage} text="PNG" />, value: 'png' },
            { label: <DropdownOption icon={AvailableIcons.faFileVideo} text="MP4" />, value: 'mp4' },
            { label: <DropdownOption icon={AvailableIcons.faGif} text="GIF" />, value: 'gif' },
        ],
        [],
    );

    return (
        <>
            <Tray isOpen={!!isMobileSize && showDownloadPanel} close={toggleDownloadPanel} title="Download">
                <DownloadDropdownContainer>
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
                        margin-bottom: 1.25rem;
                    `}
                />
            </Tray>
            <Menu
                isVisible={!isMobileSize && showDownloadPanel}
                onClose={() => undefined}
                position={{ right: 9.875 * 16, top: 3.75 * 16 } as unknown as DOMRect}
                style={{ width: 19 * 16 - 3 }}
            >
                <DownloadPanelContainer ref={downloadPanelRef}>
                    <DownloadDropdownTitle>Download</DownloadDropdownTitle>
                    <DownloadDropdownContainer>
                        <DownloadDropdownLabel>Output type</DownloadDropdownLabel>
                        <DropDown options={downloadOptions} isSearchable={false} />
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

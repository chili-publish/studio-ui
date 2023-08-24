import { AvailableIcons, Option, useOnClickOutside } from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import { useMemo, useReducer, useRef, useState } from 'react';
import DropdownOption from './DropdownOption';

const useDownload = (hideDownloadPanel: () => void) => {
    const initialDownloadState: Record<DownloadFormats, boolean> = {
        [DownloadFormats.JPG]: false,
        [DownloadFormats.PNG]: false,
        [DownloadFormats.MP4]: false,
        [DownloadFormats.GIF]: false,
        [DownloadFormats.EXPERIMENTAL_PDF]: false,
    };

    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<DownloadFormats>(DownloadFormats.JPG);

    const downloadStateReducer = (prev: typeof initialDownloadState, next: Partial<typeof initialDownloadState>) => {
        return {
            ...prev,
            ...next,
        };
    };

    const [downloadState, updateDownloadState] = useReducer(downloadStateReducer, initialDownloadState);

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

    return {
        downloadOptions,
        downloadPanelRef,
        downloadState,
        mobileDropdownOpen,
        selectedOption,
        setMobileDropdownOpen,
        setSelectedOption,
        updateDownloadState,
    };
};

export default useDownload;

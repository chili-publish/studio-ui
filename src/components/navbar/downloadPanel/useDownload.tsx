import { AvailableIcons, Option, useOnClickOutside } from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import { useMemo, useReducer, useRef, useState } from 'react';
import DropdownOption from './DropdownOption';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';

type StudioUIDownloadFormats = Exclude<DownloadFormats, DownloadFormats.EXPERIMENTAL_PDF>;

const useDownload = (hideDownloadPanel: () => void) => {
    const { outputSettings } = useUiConfigContext();
    const initialDownloadState: Record<StudioUIDownloadFormats, boolean> = {
        [DownloadFormats.JPG]: false,
        [DownloadFormats.PNG]: false,
        [DownloadFormats.MP4]: false,
        [DownloadFormats.GIF]: false,
    };

    const [selectedOption, setSelectedOption] = useState<StudioUIDownloadFormats>(DownloadFormats.JPG);

    const downloadStateReducer = (prev: typeof initialDownloadState, next: Partial<typeof initialDownloadState>) => {
        return {
            ...prev,
            ...next,
        };
    };

    const [downloadState, updateDownloadState] = useReducer(downloadStateReducer, initialDownloadState);

    const downloadPanelRef = useRef<HTMLDivElement | null>(null);
    useOnClickOutside(downloadPanelRef, hideDownloadPanel);

    const downloadOptions: Option[] = useMemo(() => {
        const allOptions = [
            {
                label: <DropdownOption icon={AvailableIcons.faImage} text="JPG" description="" />,
                value: DownloadFormats.JPG,
            },
            {
                label: <DropdownOption icon={AvailableIcons.faImage} text="PNG" description="" />,
                value: DownloadFormats.PNG,
            },
            {
                label: <DropdownOption icon={AvailableIcons.faFileVideo} text="MP4 " description="" />,
                value: DownloadFormats.MP4,
            },
            {
                label: <DropdownOption icon={AvailableIcons.faGif} text="GIF" description="" />,
                value: DownloadFormats.GIF,
            },
        ];

        // if no outputsettings defined, show all
        if (Object.keys(outputSettings).length === 0) return allOptions;

        // check if all keys are false or undefined
        const onlyFalse = Object.values(outputSettings).every((val) => val === false);

        if (onlyFalse) {
            return allOptions.filter((opt) => outputSettings[opt.value] !== false);
        }

        return allOptions.filter((opt) => outputSettings[opt.value] === true);
    }, [outputSettings]);

    return {
        downloadOptions,
        downloadPanelRef,
        downloadState,
        selectedOption,
        setSelectedOption,
        updateDownloadState,
    };
};

export default useDownload;

import { AvailableIcons, SelectOptions, useOnClickOutside } from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import DropdownOption from './DropdownOption';
import { UserInterfaceOutputSettings } from '../../../types/types';
import { outputTypesIcons } from './DownloadPanel.types';
import { useUserInterfaceDetailsContext } from '../UserInterfaceDetailsContext';

const useDownload = (hideDownloadPanel: () => void) => {
    const { outputSettings, userInterfaceOutputSettings } = useUserInterfaceDetailsContext();
    const initialDownloadState: Record<DownloadFormats, boolean> = {
        [DownloadFormats.JPG]: false,
        [DownloadFormats.PNG]: false,
        [DownloadFormats.MP4]: false,
        [DownloadFormats.GIF]: false,
        [DownloadFormats.PDF]: false,
    };

    const [selectedOptionFormat, setSelectedOptionFormat] = useState<DownloadFormats>(DownloadFormats.JPG);
    const [selectedOutputSettingsId, setSelectedOutputSettingsId] = useState<string>();

    const downloadStateReducer = (prev: typeof initialDownloadState, next: Partial<typeof initialDownloadState>) => {
        return {
            ...prev,
            ...next,
        };
    };

    const [downloadState, updateDownloadState] = useReducer(downloadStateReducer, initialDownloadState);

    const downloadPanelRef = useRef<HTMLDivElement | null>(null);
    useOnClickOutside(downloadPanelRef, hideDownloadPanel);

    const downloadOptions: SelectOptions[] = useMemo(() => {
        const allOptions = [
            {
                label: <DropdownOption iconData={AvailableIcons.faImage} text="JPG" description="" />,
                value: DownloadFormats.JPG,
                item: { type: DownloadFormats.JPG, name: 'JPG' },
            },
            {
                label: <DropdownOption iconData={AvailableIcons.faImage} text="PNG" description="" />,
                value: DownloadFormats.PNG,
                item: { type: DownloadFormats.PNG, name: 'PNG' },
            },
            {
                label: <DropdownOption iconData={AvailableIcons.faFileVideo} text="MP4 " description="" />,
                value: DownloadFormats.MP4,
                item: { type: DownloadFormats.MP4, name: 'MP4' },
            },
            {
                label: <DropdownOption iconData={AvailableIcons.faGif} text="GIF" description="" />,
                value: DownloadFormats.GIF,
                item: { type: DownloadFormats.GIF, name: 'GIF' },
            },
            {
                label: <DropdownOption iconData={AvailableIcons.faFilePdf} text="PDF" description="" />,
                value: DownloadFormats.PDF,
                item: { type: DownloadFormats.PDF, name: 'PDF' },
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

    const userInterfaceDownloadOptions: SelectOptions[] | null = useMemo(() => {
        if (!userInterfaceOutputSettings) return null;

        return userInterfaceOutputSettings.map((val) => {
            const key = val.type.toLowerCase() as 'jpg' | 'png' | 'mp4' | 'gif' | 'pdf';
            return {
                label: (
                    <DropdownOption iconData={outputTypesIcons[key]} text={val.name} description={val.description} />
                ),
                value: val.id,
                item: val,
            };
        });
    }, [userInterfaceOutputSettings]);

    const getFormatFromId = useCallback((id: string, availableOutputs: UserInterfaceOutputSettings[]) => {
        return availableOutputs.find((output) => output.id === id)?.type.toLocaleLowerCase() as DownloadFormats;
    }, []);

    useEffect(() => {
        if (userInterfaceOutputSettings && userInterfaceOutputSettings.length > 0) {
            setSelectedOutputSettingsId(userInterfaceOutputSettings[0].id);
            setSelectedOptionFormat(getFormatFromId(userInterfaceOutputSettings[0].id, userInterfaceOutputSettings));
        }
    }, [getFormatFromId, userInterfaceOutputSettings]);

    const handleOutputFormatChange = useCallback(
        (id: DownloadFormats | string) => {
            if (userInterfaceOutputSettings) {
                setSelectedOptionFormat(getFormatFromId(id, userInterfaceOutputSettings));
                setSelectedOutputSettingsId(id);
            } else {
                setSelectedOptionFormat(id as DownloadFormats);
                setSelectedOutputSettingsId(undefined);
            }
        },
        [getFormatFromId, userInterfaceOutputSettings],
    );

    return {
        downloadOptions,
        userInterfaceDownloadOptions,
        downloadPanelRef,
        downloadState,
        selectedOptionFormat,
        updateDownloadState,
        handleOutputFormatChange,
        selectedOutputSettingsId,
    };
};

export default useDownload;

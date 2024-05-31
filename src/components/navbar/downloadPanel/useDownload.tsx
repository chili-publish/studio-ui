import { AvailableIcons, Option, useOnClickOutside } from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import DropdownOption from './DropdownOption';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import { UserInterfaceOutputSettings } from '../../../types/types';

const useDownload = (hideDownloadPanel: () => void) => {
    const { outputSettings, userInterfaceOutputSettings } = useUiConfigContext();
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
            {
                label: <DropdownOption icon={AvailableIcons.faFilePdf} text="PDF" description="" />,
                value: DownloadFormats.PDF,
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

    const userInterfaceDownloadOptions: Option[] | null = useMemo(() => {
        if (!userInterfaceOutputSettings) return null;
        const outputTypesIcons = {
            jpg: AvailableIcons.faImage,
            png: AvailableIcons.faImage,
            mp4: AvailableIcons.faFileVideo,
            gif: AvailableIcons.faGif,
            pdf: AvailableIcons.faFilePdf,
        };
        return userInterfaceOutputSettings.map((val) => {
            return {
                label: (
                    <DropdownOption icon={outputTypesIcons[val.type]} text={val.name} description={val.description} />
                ),
                value: val.id,
            };
        });
    }, [userInterfaceOutputSettings]);

    const getFormatFromId = useCallback((id: string, availableOutputs: UserInterfaceOutputSettings[]) => {
        return availableOutputs.find((output) => output.id === id)?.type.toLocaleLowerCase() as DownloadFormats;
    }, []);

    useEffect(() => {
        if (userInterfaceOutputSettings) {
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

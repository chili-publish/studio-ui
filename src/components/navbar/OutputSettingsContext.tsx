import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DownloadFormats, LayoutIntent } from '@chili-publish/studio-sdk';
import {
    ProjectConfig,
    UserInterfaceOutputSettings,
    UserInterfaceWithOutputSettings,
    defaultOutputSettings,
} from '../../types/types';
import { IOutputSettingsContext } from './OutputSettingsContext.types';
import { useAppContext } from '../../contexts/AppProvider';

export const OutputSettingsContextDefaultValues: IOutputSettingsContext = {
    selectedUserInterfaceId: '',
    outputSettings: defaultOutputSettings,
    userInterfaceOutputSettings: null,
    onUserInterfaceChange: () => null,
    outputSettingsFullList: undefined,
};

export const OutputSettingsContext = createContext<IOutputSettingsContext>(OutputSettingsContextDefaultValues);

export const useOutputSettingsContext = () => {
    return useContext(OutputSettingsContext);
};

export function OutputSettingsContextProvider({
    projectConfig,
    layoutIntent,
    children,
}: {
    projectConfig: ProjectConfig;
    layoutIntent: string | null;
    children: ReactNode;
}) {
    const { dataSource } = useAppContext();

    const [selectedUserInterfaceId, setSelectedUserInterfaceId] = useState<string | null>(
        projectConfig.userInterfaceID || null,
    );
    const [userInterfaceOutputSettings, setUserInterfaceOutputSettings] = useState<
        UserInterfaceOutputSettings[] | null
    >([]);

    const [outputSettingsFullList, setOutputSettingsFullList] = useState<UserInterfaceOutputSettings[] | undefined>([]);

    const fetchOutputSettings = useCallback(
        async (userInterfaceId?: string) => {
            if (projectConfig.onFetchOutputSettings) {
                projectConfig
                    .onFetchOutputSettings(userInterfaceId)
                    .then((res: UserInterfaceWithOutputSettings | null) => {
                        let settings = res?.outputSettings?.filter((val) =>
                            val.layoutIntents.includes(layoutIntent ?? ''),
                        );
                        settings = dataSource ? settings : settings?.filter((s) => !s.dataSourceEnabled);

                        let fullSettingsList = res?.outputSettingsFullList;

                        fullSettingsList =
                            layoutIntent === LayoutIntent.digitalStatic || layoutIntent === LayoutIntent.print
                                ? outputSettingsFullList?.filter(
                                      (output) =>
                                          output.type.toLowerCase() !== DownloadFormats.MP4 &&
                                          output.type.toLowerCase() !== DownloadFormats.GIF,
                                  )
                                : outputSettingsFullList;

                        fullSettingsList = dataSource
                            ? res?.outputSettingsFullList
                            : res?.outputSettingsFullList?.filter((s) => !s.dataSourceEnabled);

                        setUserInterfaceOutputSettings(settings ?? null);
                        setSelectedUserInterfaceId(res?.userInterface?.id || null);
                        setOutputSettingsFullList(fullSettingsList);
                    });
            }
        },
        [layoutIntent, projectConfig, dataSource],
    );

    useEffect(() => {
        fetchOutputSettings(selectedUserInterfaceId || undefined);
    }, [selectedUserInterfaceId, fetchOutputSettings]);

    const data = useMemo(
        () => ({
            selectedUserInterfaceId,
            outputSettings: projectConfig.outputSettings,
            userInterfaceOutputSettings,
            onUserInterfaceChange: setSelectedUserInterfaceId,
            outputSettingsFullList,
        }),
        [
            selectedUserInterfaceId,
            userInterfaceOutputSettings,
            projectConfig.outputSettings,
            setSelectedUserInterfaceId,
            outputSettingsFullList,
        ],
    );

    return <OutputSettingsContext.Provider value={data}>{children}</OutputSettingsContext.Provider>;
}

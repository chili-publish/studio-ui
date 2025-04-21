import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DownloadFormats, LayoutIntent } from '@chili-publish/studio-sdk';
import {
    FormBuilderType,
    ProjectConfig,
    UserInterfaceOutputSettings,
    UserInterfaceWithOutputSettings,
    defaultFormBuilder,
    defaultOutputSettings,
} from '../../types/types';
import { IUserInterfaceDetailsContext } from './UserInterfaceDetailsContext.types';
import { useAppContext } from '../../contexts/AppProvider';

export const UserInterfaceDetailsContextDefaultValues: IUserInterfaceDetailsContext = {
    selectedUserInterfaceId: '',
    outputSettings: defaultOutputSettings,
    userInterfaceOutputSettings: null,
    onUserInterfaceChange: () => null,
    formBuilder: defaultFormBuilder,
    outputSettingsFullList: undefined,
};

export const UserInterfaceDetailsContext = createContext<IUserInterfaceDetailsContext>(
    UserInterfaceDetailsContextDefaultValues,
);

export const useUserInterfaceDetailsContext = () => {
    return useContext(UserInterfaceDetailsContext);
};

export function UserInterfaceDetailsContextProvider({
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
    const [formBuilder, setFormBuilder] = useState<FormBuilderType | undefined>();

    const [outputSettingsFullList, setOutputSettingsFullList] = useState<UserInterfaceOutputSettings[] | undefined>([]);

    const fetchtUserInterfaceDetails = useCallback(
        async (userInterfaceId?: string) => {
            if (projectConfig.onFetchUserInterfaceDetails) {
                projectConfig
                    .onFetchUserInterfaceDetails(userInterfaceId)
                    .then((res: UserInterfaceWithOutputSettings | null) => {
                        let settings = res?.outputSettings?.filter((val) =>
                            val.layoutIntents.includes(layoutIntent ?? ''),
                        );
                        settings = dataSource ? settings : settings?.filter((s) => !s.dataSourceEnabled);

                        let fullSettingsList = res?.outputSettingsFullList;

                        fullSettingsList =
                            layoutIntent === LayoutIntent.digitalStatic || layoutIntent === LayoutIntent.print
                                ? fullSettingsList?.filter(
                                      (output) =>
                                          output.type.toLowerCase() !== DownloadFormats.MP4 &&
                                          output.type.toLowerCase() !== DownloadFormats.GIF,
                                  )
                                : fullSettingsList;

                        fullSettingsList = dataSource
                            ? fullSettingsList
                            : fullSettingsList?.filter((s) => !s.dataSourceEnabled);

                        setUserInterfaceOutputSettings(settings ?? null);
                        setSelectedUserInterfaceId(res?.userInterface?.id || null);
                        setFormBuilder(() =>
                            res?.formBuilder
                                ? ({
                                      ...res?.formBuilder,
                                      variables: {
                                          ...res?.formBuilder?.variables,
                                          header: res?.formBuilder?.variables?.active
                                              ? res?.formBuilder?.variables.header
                                              : defaultFormBuilder.variables.header,
                                          helpText: res?.formBuilder?.variables?.active
                                              ? res?.formBuilder?.variables.helpText
                                              : defaultFormBuilder.variables.helpText,
                                      },
                                  } as FormBuilderType)
                                : defaultFormBuilder,
                        );
                        setOutputSettingsFullList(fullSettingsList);
                    });
            }
        },
        [layoutIntent, projectConfig, dataSource],
    );

    useEffect(() => {
        fetchtUserInterfaceDetails(selectedUserInterfaceId || undefined);
    }, [selectedUserInterfaceId, fetchtUserInterfaceDetails]);

    const data = useMemo(
        () => ({
            selectedUserInterfaceId,
            outputSettings: projectConfig.outputSettings,
            userInterfaceOutputSettings,
            onUserInterfaceChange: setSelectedUserInterfaceId,
            formBuilder: {
                datasource: formBuilder?.datasource ?? defaultFormBuilder.datasource,
                layouts: formBuilder?.layouts ?? defaultFormBuilder.layouts,
                variables: formBuilder?.variables ?? defaultFormBuilder.variables,
            },
            outputSettingsFullList,
        }),
        [
            selectedUserInterfaceId,
            userInterfaceOutputSettings,
            projectConfig.outputSettings,
            setSelectedUserInterfaceId,
            formBuilder,
            outputSettingsFullList,
        ],
    );

    return <UserInterfaceDetailsContext.Provider value={data}>{children}</UserInterfaceDetailsContext.Provider>;
}

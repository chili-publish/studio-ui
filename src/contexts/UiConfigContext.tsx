import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { IUiConfigContext } from './UiConfigContext.types';
import {
    ProjectConfig,
    UserInterface,
    UserInterfaceOutputSettings,
    UserInterfaceWithOutputSettings,
    defaultOutputSettings,
    defaultUiOptions,
} from '../types/types';

export const UiConfigContextDefaultValues: IUiConfigContext = {
    uiOptions: defaultUiOptions,
    outputSettings: defaultOutputSettings,
    userInterfaceOutputSettings: null,
    isDownloadBtnVisible: defaultUiOptions.widgets.backButton?.visible || false,
    isBackBtnVisible: defaultUiOptions.widgets.downloadButton?.visible || false,
    graFxStudioEnvironmentApiBaseUrl: '',

    userInterfaces: [],
    selectedUserInterfaceId: '',
    onUserInterfaceChange: () => null,
};

export const UiConfigContext = createContext<IUiConfigContext>(UiConfigContextDefaultValues);

export const useUiConfigContext = () => {
    return useContext(UiConfigContext);
};

export function UiConfigContextProvider({
    children,
    projectConfig,
    layoutIntent,
}: {
    children: ReactNode;
    projectConfig: ProjectConfig;
    layoutIntent: string | null;
}) {
    const [selectedUserInterfaceId, setSelectedUserInterfaceId] = useState<string | null>(
        projectConfig.userInterfaceID || null,
    );
    const [userInterfaces, setUserInterfaces] = useState<UserInterface[]>([]);
    const [userInterfaceOutputSettings, setUserInterfaceOutputSettings] = useState<
        UserInterfaceOutputSettings[] | null
    >(null);

    const fetchOutputSettings = useCallback(
        async (userInterfaceId?: string) => {
            if (projectConfig.onFetchOutputSettings) {
                projectConfig
                    .onFetchOutputSettings(userInterfaceId)
                    .then((res: UserInterfaceWithOutputSettings | null) => {
                        setUserInterfaceOutputSettings(
                            res?.outputSettings?.filter((val) => val.layoutIntents.includes(layoutIntent ?? '')) ??
                                null,
                        );
                        setSelectedUserInterfaceId(res?.userInterface?.id || null);
                    });
            }
        },
        [layoutIntent, projectConfig],
    );

    useEffect(() => {
        fetchOutputSettings();
    }, [fetchOutputSettings]);

    useEffect(() => {
        if (!selectedUserInterfaceId) return;
        fetchOutputSettings(selectedUserInterfaceId);
    }, [selectedUserInterfaceId, fetchOutputSettings]);

    useEffect(() => {
        if (projectConfig.onFetchUserInterfaces) {
            projectConfig.onFetchUserInterfaces().then((res) => {
                setUserInterfaces(res?.data?.data || []);
            });
        }
    }, [projectConfig]);

    const data = useMemo(
        () => ({
            userInterfaces,
            selectedUserInterfaceId,
            onUserInterfaceChange: setSelectedUserInterfaceId,
            uiOptions: projectConfig.uiOptions,
            outputSettings: projectConfig.outputSettings,
            graFxStudioEnvironmentApiBaseUrl: projectConfig.graFxStudioEnvironmentApiBaseUrl,
            userInterfaceOutputSettings,
            isDownloadBtnVisible: projectConfig.uiOptions.widgets?.downloadButton?.visible ?? false,
            isBackBtnVisible: projectConfig.uiOptions.widgets?.backButton?.visible ?? false,
        }),
        [
            userInterfaces,
            selectedUserInterfaceId,
            projectConfig.outputSettings,
            projectConfig.uiOptions,
            projectConfig.graFxStudioEnvironmentApiBaseUrl,
            userInterfaceOutputSettings,
        ],
    );

    return <UiConfigContext.Provider value={data}>{children}</UiConfigContext.Provider>;
}

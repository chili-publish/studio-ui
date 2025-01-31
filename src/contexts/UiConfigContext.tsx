import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    ProjectConfig,
    UserInterface,
    UserInterfaceOutputSettings,
    UserInterfaceWithOutputSettings,
    defaultOutputSettings,
    defaultUiOptions,
} from '../types/types';
import { useAppContext } from './AppProvider';
import { IUiConfigContext } from './UiConfigContext.types';

export const UiConfigContextDefaultValues: IUiConfigContext = {
    uiOptions: defaultUiOptions,
    outputSettings: defaultOutputSettings,
    userInterfaceOutputSettings: null,
    isDownloadBtnVisible: false,
    isBackBtnVisible: defaultUiOptions.widgets.downloadButton?.visible || false,
    graFxStudioEnvironmentApiBaseUrl: '',

    userInterfaces: [],
    selectedUserInterfaceId: '',
    onUserInterfaceChange: () => null,
    onVariableFocus: () => null,
    onVariableBlur: () => null,
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
    const { dataSource } = useAppContext();

    const [selectedUserInterfaceId, setSelectedUserInterfaceId] = useState<string | null>(
        projectConfig.userInterfaceID || null,
    );
    const [userInterfaces, setUserInterfaces] = useState<UserInterface[]>([]);
    const [userInterfaceOutputSettings, setUserInterfaceOutputSettings] = useState<
        UserInterfaceOutputSettings[] | null
    >([]);

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
                        setUserInterfaceOutputSettings(settings ?? null);
                        setSelectedUserInterfaceId(res?.userInterface?.id || null);
                    });
            }
        },
        [layoutIntent, projectConfig, dataSource],
    );

    useEffect(() => {
        fetchOutputSettings(selectedUserInterfaceId || undefined);
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
            onVariableFocus: projectConfig.onVariableFocus,
            onVariableBlur: projectConfig.onVariableBlur,
        }),
        [
            userInterfaces,
            selectedUserInterfaceId,
            projectConfig.uiOptions,
            projectConfig.outputSettings,
            projectConfig.graFxStudioEnvironmentApiBaseUrl,
            projectConfig.onVariableFocus,
            projectConfig.onVariableBlur,
            userInterfaceOutputSettings,
        ],
    );

    return <UiConfigContext.Provider value={data}>{children}</UiConfigContext.Provider>;
}

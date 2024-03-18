import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { IUiConfigContext } from './UiConfigContext.types';
import { ProjectConfig, UserInterfaceOutputSettings, defaultOutputSettings, defaultUiOptions } from '../types/types';

export const UiConfigContextDefaultValues: IUiConfigContext = {
    uiOptions: defaultUiOptions,
    outputSettings: defaultOutputSettings,
    userInterfaceOutputSettings: null,
    isDownloadBtnVisible: defaultUiOptions.widgets.backButton?.visible || false,
    isBackBtnVisible: defaultUiOptions.widgets.downloadButton?.visible || false,
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
    const [userInterfaceOutputSettings, setUserInterfaceOutputSettings] = useState<
        UserInterfaceOutputSettings[] | null
    >(null);

    useEffect(() => {
        if (projectConfig.onFetchOutputSettings) {
            projectConfig.onFetchOutputSettings().then((res: UserInterfaceOutputSettings[] | null) => {
                setUserInterfaceOutputSettings(
                    res?.filter((val) => val.layoutIntents.includes(layoutIntent ?? '')) ?? null,
                );
            });
        }
    }, [projectConfig, layoutIntent]);
    const data = useMemo(
        () => ({
            uiOptions: projectConfig.uiOptions,
            outputSettings: projectConfig.outputSettings,
            userInterfaceOutputSettings,
            isDownloadBtnVisible: projectConfig.uiOptions.widgets?.downloadButton?.visible ?? false,
            isBackBtnVisible: projectConfig.uiOptions.widgets?.backButton?.visible ?? false,
        }),
        [projectConfig.outputSettings, projectConfig.uiOptions, userInterfaceOutputSettings],
    );

    return <UiConfigContext.Provider value={data}>{children}</UiConfigContext.Provider>;
}

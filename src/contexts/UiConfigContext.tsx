import { ReactNode, createContext, useContext, useMemo } from 'react';
import { IUiConfigContext } from './UiConfigContext.types';
import { ProjectConfig, defaultOutputSettings, defaultUiOptions } from '../types/types';

export const UiConfigContextDefaultValues: IUiConfigContext = {
    uiOptions: defaultUiOptions,
    outputSettings: defaultOutputSettings,
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
}: {
    children: ReactNode;
    projectConfig: ProjectConfig;
}) {
    const data = useMemo(
        () => ({
            uiOptions: projectConfig.uiOptions,
            outputSettings: projectConfig.outputSettings,
            isDownloadBtnVisible: projectConfig.uiOptions.widgets?.downloadButton?.visible || false,
            isBackBtnVisible: projectConfig.uiOptions.widgets?.backButton?.visible || false,
        }),
        [projectConfig],
    );

    return <UiConfigContext.Provider value={data}>{children}</UiConfigContext.Provider>;
}

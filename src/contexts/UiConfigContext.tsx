import { ReactNode, createContext, useContext, useMemo } from 'react';
import { ProjectConfig, defaultUiOptions } from '../types/types';
import { IUiConfigContext } from './UiConfigContext.types';

export const UiConfigContextDefaultValues: IUiConfigContext = {
    projectConfig: {} as ProjectConfig,
    uiOptions: defaultUiOptions,
    isDownloadBtnVisible: false,
    isBackBtnVisible: defaultUiOptions.widgets.downloadButton?.visible || false,
    graFxStudioEnvironmentApiBaseUrl: '',
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
}: {
    children: ReactNode;
    projectConfig: ProjectConfig;
}) {
    const data = useMemo(
        () => ({
            projectConfig,
            uiOptions: projectConfig.uiOptions,
            graFxStudioEnvironmentApiBaseUrl: projectConfig.graFxStudioEnvironmentApiBaseUrl,
            isDownloadBtnVisible: projectConfig.uiOptions.widgets?.downloadButton?.visible ?? false,
            isBackBtnVisible: projectConfig.uiOptions.widgets?.backButton?.visible ?? false,
            onVariableFocus: projectConfig.onVariableFocus,
            onVariableBlur: projectConfig.onVariableBlur,
        }),
        [projectConfig],
    );

    return <UiConfigContext.Provider value={data}>{children}</UiConfigContext.Provider>;
}

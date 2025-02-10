import { ProjectConfig, UiOptions } from '../types/types';

export interface IUiConfigContext {
    projectConfig: ProjectConfig;

    uiOptions: UiOptions;
    isDownloadBtnVisible: boolean;
    isBackBtnVisible: boolean;
    graFxStudioEnvironmentApiBaseUrl: string;
    onVariableFocus?: (id: string) => void;
    onVariableBlur?: (id: string) => void;
}

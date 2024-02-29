import { OutputSettings, UiOptions, UserInterfaceOutputSettings } from '../types/types';

export interface IUiConfigContext {
    uiOptions: UiOptions;
    outputSettings: OutputSettings;
    userInterfaceOutputSettings: UserInterfaceOutputSettings[] | null;
    isDownloadBtnVisible: boolean;
    isBackBtnVisible: boolean;
}

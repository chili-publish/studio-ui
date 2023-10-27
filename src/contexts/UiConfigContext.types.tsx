import { OutputSettings, UiOptions } from '../types/types';

export interface IUiConfigContext {
    uiOptions: UiOptions;
    outputSettings: OutputSettings;
    isDownloadBtnVisible: boolean;
    isBackBtnVisible: boolean;
}

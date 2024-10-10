import { OutputSettings, UiOptions, UserInterface, UserInterfaceOutputSettings } from '../types/types';

export interface IUiConfigContext {
    uiOptions: UiOptions;
    outputSettings: OutputSettings;
    userInterfaceOutputSettings: UserInterfaceOutputSettings[] | null;
    isDownloadBtnVisible: boolean;
    isBackBtnVisible: boolean;
    graFxStudioEnvironmentApiBaseUrl: string;

    userInterfaces: UserInterface[];
    selectedUserInterfaceId: string | null;
    onUserInterfaceChange: (_: string) => void;
}

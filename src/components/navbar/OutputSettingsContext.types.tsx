import { OutputSettings, UserInterfaceOutputSettings } from '../../types/types';

export interface IOutputSettingsContext {
    outputSettings: OutputSettings;
    userInterfaceOutputSettings: UserInterfaceOutputSettings[] | null;
    selectedUserInterfaceId: string | null;
    onUserInterfaceChange: (_: string) => void;
}

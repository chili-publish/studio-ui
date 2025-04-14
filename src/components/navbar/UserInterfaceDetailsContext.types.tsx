import { FormBuilderType, OutputSettings, UserInterfaceOutputSettings } from '../../types/types';

export interface IUserInterfaceDetailsContext {
    outputSettings: OutputSettings;
    userInterfaceOutputSettings: UserInterfaceOutputSettings[] | null;
    selectedUserInterfaceId: string | null;
    onUserInterfaceChange: (_: string) => void;
    formBuilder: FormBuilderType;
    outputSettingsFullList: UserInterfaceOutputSettings[] | undefined;
}

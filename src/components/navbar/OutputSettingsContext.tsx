import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    ProjectConfig,
    UserInterfaceOutputSettings,
    UserInterfaceWithOutputSettings,
    defaultOutputSettings,
} from '../../types/types';
import { IOutputSettingsContext } from './OutputSettingsContext.types';
import { useAppContext } from '../../contexts/AppProvider';
import { OutputType } from '../../utils/ApiTypes';

export const OutputSettingsContextDefaultValues: IOutputSettingsContext = {
    selectedUserInterfaceId: '',
    outputSettings: defaultOutputSettings,
    userInterfaceOutputSettings: null,
    onUserInterfaceChange: () => null,
};

export const OutputSettingsContext = createContext<IOutputSettingsContext>(OutputSettingsContextDefaultValues);

export const useOutputSettingsContext = () => {
    return useContext(OutputSettingsContext);
};

export function OutputSettingsContextProvider({
    projectConfig,
    layoutIntent,
    children,
}: {
    projectConfig: ProjectConfig;
    layoutIntent: string | null;
    children: ReactNode;
}) {
    const { dataSource } = useAppContext();

    const [selectedUserInterfaceId, setSelectedUserInterfaceId] = useState<string | null>(
        projectConfig.userInterfaceID || null,
    );
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

                        settings = dataSource ? settings : settings?.filter((s) => s.outputType !== OutputType.Batch);
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

    const data = useMemo(
        () => ({
            selectedUserInterfaceId,
            outputSettings: projectConfig.outputSettings,
            userInterfaceOutputSettings,
            onUserInterfaceChange: setSelectedUserInterfaceId,
        }),
        [
            selectedUserInterfaceId,
            userInterfaceOutputSettings,
            projectConfig.outputSettings,
            setSelectedUserInterfaceId,
        ],
    );

    return <OutputSettingsContext.Provider value={data}>{children}</OutputSettingsContext.Provider>;
}

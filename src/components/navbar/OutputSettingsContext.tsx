import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    LayoutForm,
    ProjectConfig,
    UserInterfaceOutputSettings,
    UserInterfaceWithOutputSettings,
    defaultOutputSettings,
} from '../../types/types';
import { IOutputSettingsContext } from './OutputSettingsContext.types';
import { useAppContext } from '../../contexts/AppProvider';

export const OutputSettingsContextDefaultValues: IOutputSettingsContext = {
    selectedUserInterfaceId: '',
    outputSettings: defaultOutputSettings,
    userInterfaceOutputSettings: null,
    onUserInterfaceChange: () => null,
    layoutsFormBuilderData: null,
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
    const [layoutsFormBuilderData, setLayoutsFormBuilderData] = useState<LayoutForm | null>(null);

    const fetchOutputSettings = useCallback(
        async (userInterfaceId?: string) => {
            if (projectConfig.onFetchOutputSettings) {
                projectConfig
                    .onFetchOutputSettings(userInterfaceId)
                    .then((res: UserInterfaceWithOutputSettings | null) => {
                        let settings = res?.outputSettings?.filter((val) =>
                            val.layoutIntents.includes(layoutIntent ?? ''),
                        );
                        // eslint-disable-next-line no-console
                        console.log('onFetch', res);
                        settings = dataSource ? settings : settings?.filter((s) => !s.dataSourceEnabled);
                        setUserInterfaceOutputSettings(settings ?? null);
                        setSelectedUserInterfaceId(res?.userInterface?.id || null);
                        setLayoutsFormBuilderData(res?.formBuilder?.layouts || null);
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
            layoutsFormBuilderData,
        }),
        [
            selectedUserInterfaceId,
            userInterfaceOutputSettings,
            projectConfig.outputSettings,
            setSelectedUserInterfaceId,
            layoutsFormBuilderData,
        ],
    );

    return <OutputSettingsContext.Provider value={data}>{children}</OutputSettingsContext.Provider>;
}

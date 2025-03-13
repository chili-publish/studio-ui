import { ConnectorInstance } from '@chili-publish/studio-sdk/lib/src/next';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type Mode = 'design' | 'run';

export interface IAppContext {
    isDocumentLoaded: boolean;
    selectedMode: Mode;
    dataSource?: ConnectorInstance;
    isDataSourceModalOpen: boolean;
    updateSelectedMode: (_: string) => void;
    setIsDataSourceModalOpen: (_: boolean) => void;
    cleanRunningTasks: () => Promise<void>;
}

const AppContext = createContext<IAppContext>({
    isDocumentLoaded: false,
    selectedMode: 'run',
    isDataSourceModalOpen: false,
    updateSelectedMode: () => null,
    setIsDataSourceModalOpen: () => null,
    cleanRunningTasks: () => Promise.resolve(),
});

export const useAppContext = () => {
    return useContext(AppContext);
};

function AppProvider({
    isDocumentLoaded,
    isAnimationPlaying,
    dataSource,
    children,
}: {
    isDocumentLoaded?: boolean;
    isAnimationPlaying?: boolean;
    dataSource?: ConnectorInstance;
    children: ReactNode;
}) {
    const [selectedMode, setSelectedMode] = useState<Mode>('run');
    const [isDataSourceModalOpen, setIsDataSourceModalOpen] = useState(false);

    const cleanRunningTasks = useCallback(async () => {
        if (isAnimationPlaying) await window.StudioUISDK.animation.pause();
        setIsDataSourceModalOpen(false);
    }, [isAnimationPlaying]);

    const updateSelectedMode = useCallback((val: string) => {
        setSelectedMode(val as Mode);
    }, []);

    const data = useMemo(
        () => ({
            isDocumentLoaded: !!isDocumentLoaded,
            selectedMode,
            dataSource,
            isDataSourceModalOpen,
            setIsDataSourceModalOpen,
            updateSelectedMode,
            cleanRunningTasks,
        }),
        [
            isDocumentLoaded,
            dataSource,
            selectedMode,
            isDataSourceModalOpen,
            updateSelectedMode,
            cleanRunningTasks,
            setIsDataSourceModalOpen,
        ],
    );

    return <AppContext.Provider value={data}>{children}</AppContext.Provider>;
}

export default AppProvider;

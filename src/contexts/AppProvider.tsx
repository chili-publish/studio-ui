import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type Mode = 'design' | 'run';

interface IAppContext {
    isDocumentLoaded: boolean;
    selectedMode: Mode;
    updateSelectedMode: (_: string) => void;
    cleanRunningTasks: () => Promise<void>;
}

const AppContext = createContext<IAppContext>({
    isDocumentLoaded: false,
    selectedMode: 'run',
    updateSelectedMode: () => null,
    cleanRunningTasks: () => Promise.resolve(),
});

export const useAppContext = () => {
    return useContext(AppContext);
};

function AppProvider({
    isDocumentLoaded,
    isAnimationPlaying,
    children,
}: {
    isDocumentLoaded: boolean;
    isAnimationPlaying: boolean;
    children: ReactNode;
}) {
    const [selectedMode, setSelectedMode] = useState<Mode>('run');

    const cleanRunningTasks = useCallback(async () => {
        if (isAnimationPlaying) await window.StudioUISDK.animation.pause();
    }, [isAnimationPlaying]);

    const updateSelectedMode = useCallback((val: string) => {
        setSelectedMode(val as Mode);
    }, []);

    const data = useMemo(
        () => ({
            isDocumentLoaded,
            selectedMode,
            updateSelectedMode,
            cleanRunningTasks,
        }),
        [isDocumentLoaded, selectedMode, updateSelectedMode, cleanRunningTasks],
    );

    return <AppContext.Provider value={data}>{children}</AppContext.Provider>;
}

export default AppProvider;

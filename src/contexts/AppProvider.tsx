import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type Mode = 'design' | 'run';

interface IAppContext {
    selectedMode: Mode;
    updateSelectedMode: (_: string) => void;
    cleanRunningTasks: () => Promise<void>;
}

const AppContext = createContext<IAppContext>({
    selectedMode: 'run',
    updateSelectedMode: () => null,
    cleanRunningTasks: () => Promise.resolve(),
});

export const useAppContext = () => {
    return useContext(AppContext);
};

function AppProvider({ children }: { children: ReactNode }) {
    const [selectedMode, setSelectedMode] = useState<Mode>('run');

    const cleanRunningTasks = useCallback(async () => {
        await window.StudioUISDK.animation.pause();
    }, []);

    const updateSelectedMode = useCallback((val: string) => {
        setSelectedMode(val as Mode);
    }, []);

    const data = useMemo(
        () => ({
            selectedMode,
            updateSelectedMode,
            cleanRunningTasks,
        }),
        [selectedMode, updateSelectedMode, cleanRunningTasks],
    );

    return <AppContext.Provider value={data}>{children}</AppContext.Provider>;
}

export default AppProvider;

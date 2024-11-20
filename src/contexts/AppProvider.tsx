import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';

interface IAppContext {
    cleanRunningTasks: () => Promise<void>;
}
const AppContext = createContext<IAppContext>({
    cleanRunningTasks: () => Promise.resolve(),
});

export const useAppContext = () => {
    return useContext(AppContext);
};

function AppProvider({ children }: { children: ReactNode }) {
    const cleanRunningTasks = useCallback(async () => {
        await window.StudioUISDK.animation.pause();
    }, []);

    const data = useMemo(
        () => ({
            cleanRunningTasks,
        }),
        [cleanRunningTasks],
    );

    return <AppContext.Provider value={data}>{children}</AppContext.Provider>;
}

export default AppProvider;

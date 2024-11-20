import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';

interface IAppContext {
    isDocumentLoaded: boolean;
    cleanRunningTasks: () => Promise<void>;
}

const AppContext = createContext<IAppContext>({
    isDocumentLoaded: false,
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
    const cleanRunningTasks = useCallback(async () => {
        if (isAnimationPlaying) await window.StudioUISDK.animation.pause();
    }, [isAnimationPlaying]);

    const data = useMemo(
        () => ({
            isDocumentLoaded,
            cleanRunningTasks,
        }),
        [isDocumentLoaded, cleanRunningTasks],
    );

    return <AppContext.Provider value={data}>{children}</AppContext.Provider>;
}

export default AppProvider;

import { useCallback } from 'react';

const useUndoRedo = (undoStackState: { canRedo: boolean; canUndo: boolean }) => {
    const handleUndo = useCallback(() => {
        (async () => {
            if (undoStackState?.canUndo) await window.StudioUISDK.undoManager.undo();
        })();
    }, [undoStackState?.canUndo]);

    const handleRedo = useCallback(() => {
        (async () => {
            if (undoStackState?.canRedo) await window.StudioUISDK.undoManager.redo();
        })();
    }, [undoStackState?.canRedo]);

    return {
        handleUndo,
        handleRedo,
    };
};
export default useUndoRedo;

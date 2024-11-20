import { startTransition, useCallback, useEffect, useMemo } from 'react';
import { useGetIframeAsync } from '@chili-publish/grafx-shared-components';
import { ProjectConfig } from '../../types/types';
import { isMac } from './shortcuts';
import useUndoRedo from './useUndoRedo';
import useZoom from './useZoom';
import { useAppContext } from '../AppProvider';

interface ShortcutProviderProps {
    projectConfig: ProjectConfig;
    zoom: number;
    undoStackState: { canUndo: boolean; canRedo: boolean };
    children: React.ReactNode;
}
function ShortcutProvider({ projectConfig, undoStackState, zoom, children }: ShortcutProviderProps) {
    const commandKey = isMac ? 'metaKey' : 'ctrlKey';
    const iframe = useGetIframeAsync({ containerId: 'studio-ui-chili-editor' })?.contentWindow;

    const modifierKeys = useCallback((): (keyof KeyboardEvent)[] => {
        return [commandKey, 'shiftKey', 'altKey'];
    }, [commandKey]);

    const { handleUndo, handleRedo } = useUndoRedo(undoStackState);
    const { zoomIn, zoomOut } = useZoom(zoom);
    const { isDocumentLoaded, cleanRunningTasks } = useAppContext();

    const shortcuts = useMemo(
        () => [
            {
                keys: 'm',
                action: async () => {
                    if (!isDocumentLoaded) return;
                    await cleanRunningTasks();
                    startTransition(() => projectConfig?.onSandboxModeToggle?.());
                },
            },
            {
                keys: `${commandKey} z`,
                action: (e: KeyboardEvent) => {
                    e.preventDefault();
                    if (undoStackState.canUndo) handleUndo();
                },
            },
            {
                keys: `${commandKey} shiftKey z`,
                action: (e: KeyboardEvent) => {
                    e.preventDefault();
                    if (undoStackState.canRedo) handleRedo();
                },
            },
            {
                keys: [`${commandKey} =`, `${commandKey} +`, `equal`, `add`],
                action: (e: KeyboardEvent) => {
                    e.preventDefault();
                    if (zoom) zoomIn();
                },
            },
            {
                keys: `${commandKey} -`,
                action: (e: KeyboardEvent) => {
                    e.preventDefault();
                    if (zoom) zoomOut();
                },
            },
        ],
        [
            isDocumentLoaded,
            projectConfig,
            undoStackState,
            handleUndo,
            handleRedo,
            zoom,
            zoomIn,
            zoomOut,
            commandKey,
            cleanRunningTasks,
        ],
    );

    const compareShortcuts = (shortcut: string | string[], pressedKeys: string) => {
        // This function makes sure that the order of shortcut keys won't break the functionality
        const pressedKeysCombination = pressedKeys.split(' ').sort().join(' ');
        if (Array.isArray(shortcut)) {
            const shortcutKeys = shortcut.map((option) => option.split(' ').sort().join(' ').toLowerCase());
            return shortcutKeys.some((keys) => keys === pressedKeysCombination);
        }
        const shortcutKeys = shortcut.split(' ').sort().join(' ').toLowerCase();
        return shortcutKeys === pressedKeysCombination;
    };

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const formElements = ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'];
            if (formElements.includes((event.target as HTMLElement).tagName)) {
                return;
            }
            const pressedKeys = [];
            modifierKeys().forEach((modifier) => {
                if (event[modifier]) {
                    pressedKeys.push(modifier);
                }
            });
            pressedKeys.push(event.key);

            const pressedKeysString = pressedKeys.join(' ').toLowerCase();

            // loop through the shortcuts and execute the action if found
            shortcuts.find((value) => compareShortcuts(value.keys, pressedKeysString))?.action(event);
        },
        [modifierKeys, shortcuts],
    );

    useEffect(() => {
        const addShortcutListeners = () => {
            document.addEventListener('keydown', handleKeyDown);
            iframe?.addEventListener('keydown', handleKeyDown);
        };

        const removeShortcutListeners = () => {
            document.removeEventListener('keydown', handleKeyDown);
            iframe?.removeEventListener('keydown', handleKeyDown);
        };

        addShortcutListeners();

        return () => {
            removeShortcutListeners();
        };
    }, [handleKeyDown, iframe]);

    return children;
}

export default ShortcutProvider;

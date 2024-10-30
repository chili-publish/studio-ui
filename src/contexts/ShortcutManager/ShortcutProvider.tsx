import { useCallback, useEffect, useMemo } from 'react';
import { useGetIframeAsync } from '@chili-publish/grafx-shared-components';
import { ProjectConfig } from '../../types/types';
import { getShortcut } from './shortcuts';

export const isMac = /Macintosh/.test(navigator.userAgent);

function ShortcutProvider({ projectConfig, children }: { projectConfig: ProjectConfig; children: React.ReactNode }) {
    const commandKey = isMac ? 'metaKey' : 'ctrlKey';
    const iframe = useGetIframeAsync()?.contentWindow;
    const modifierKeys = useCallback((): (keyof KeyboardEvent)[] => {
        return [commandKey, 'shiftKey', 'altKey'];
    }, [commandKey]);

    const shortcuts = useMemo(
        () => [
            { keys: 'm', action: () => projectConfig?.onSandboxModeToggle?.() },
            { keys: getShortcut('undo'), action: () => projectConfig?.onSandboxModeToggle?.() },
            { keys: getShortcut('redo'), action: () => projectConfig?.onSandboxModeToggle?.() },
            { keys: getShortcut('zoomIn'), action: () => projectConfig?.onSandboxModeToggle?.() },
            { keys: getShortcut('zoomOut'), action: () => projectConfig?.onSandboxModeToggle?.() },
        ],
        [projectConfig],
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
            const pressedKeys = [];
            modifierKeys().forEach((modifier) => {
                if (event[modifier]) {
                    pressedKeys.push(modifier);
                }
            });
            pressedKeys.push(event.key);

            const pressedKeysString = pressedKeys.join(' ').toLowerCase();

            // loop through the shortcuts and execute the action if found
            shortcuts.find((value) => compareShortcuts(value.keys, pressedKeysString))?.action();
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

import EditorSDK from '@chili-publish/studio-sdk';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import AppProvider from '../../contexts/AppProvider';
import ShortcutProvider from '../../contexts/ShortcutManager/ShortcutProvider';
import { ProjectConfig } from '../../types/types';

describe('ShortcutProvider', () => {
    const mockSDK = mock<EditorSDK>();

    mockSDK.undoManager.undo = jest.fn().mockImplementation().mockReturnValue({ success: true, code: 200 });

    mockSDK.undoManager.redo = jest.fn().mockImplementation().mockReturnValue({ success: true, code: 200 });

    mockSDK.canvas.setZoomPercentage = jest.fn().mockImplementation().mockReturnValue({ success: true, code: 200 });

    window.StudioUISDK = mockSDK;

    it('triggers the sandbox toggle shortcut', async () => {
        const user = userEvent.setup();
        const onSandboxModeToggleFn = jest.fn();
        const projectConfig = { onSandboxModeToggle: onSandboxModeToggleFn } as unknown as ProjectConfig;
        render(
            <AppProvider isDocumentLoaded>
                <ShortcutProvider
                    projectConfig={projectConfig}
                    zoom={100}
                    undoStackState={{ canRedo: true, canUndo: true }}
                >
                    <h1>This is a test</h1>
                </ShortcutProvider>
            </AppProvider>,
        );
        expect(onSandboxModeToggleFn).not.toHaveBeenCalled();
        await user.keyboard('m');
        expect(onSandboxModeToggleFn).toHaveBeenCalled();
    });

    it('triggers undo shortcut', async () => {
        const onSandboxModeToggleFn = jest.fn();
        const projectConfig = { onSandboxModeToggle: onSandboxModeToggleFn } as unknown as ProjectConfig;
        render(
            <AppProvider isDocumentLoaded>
                <ShortcutProvider
                    projectConfig={projectConfig}
                    zoom={100}
                    undoStackState={{ canRedo: true, canUndo: true }}
                >
                    <h1>This is a test</h1>
                </ShortcutProvider>
            </AppProvider>,
        );
        expect(mockSDK.undoManager.undo).not.toHaveBeenCalled();
        fireEvent.keyDown(screen.getByText('This is a test'), { key: 'z', ctrlKey: true });
        expect(mockSDK.undoManager.undo).toHaveBeenCalled();
    });

    it('triggers redo shortcut', async () => {
        const projectConfig = {} as unknown as ProjectConfig;
        render(
            <AppProvider isDocumentLoaded>
                <ShortcutProvider
                    projectConfig={projectConfig}
                    zoom={100}
                    undoStackState={{ canRedo: true, canUndo: true }}
                >
                    <h1>This is a test</h1>
                </ShortcutProvider>
            </AppProvider>,
        );
        expect(mockSDK.undoManager.redo).not.toHaveBeenCalled();
        fireEvent.keyDown(screen.getByText('This is a test'), { ctrlKey: true, shiftKey: true, key: 'Z' });
        expect(mockSDK.undoManager.redo).toHaveBeenCalled();
    });

    it('triggers zoom in shortcut', async () => {
        const projectConfig = {} as unknown as ProjectConfig;
        const zoom = 150;
        render(
            <AppProvider isDocumentLoaded>
                <ShortcutProvider
                    projectConfig={projectConfig}
                    zoom={zoom}
                    undoStackState={{ canRedo: true, canUndo: true }}
                >
                    <h1>This is a test</h1>
                </ShortcutProvider>
            </AppProvider>,
        );
        fireEvent.keyDown(screen.getByText('This is a test'), { key: '+', ctrlKey: true });
        expect(mockSDK.canvas.setZoomPercentage).toHaveBeenCalledWith(zoom * 1.142);
    });

    it('triggers zoom out shortcut', async () => {
        const projectConfig = {} as unknown as ProjectConfig;
        const zoom = 120;
        render(
            <AppProvider isDocumentLoaded>
                <ShortcutProvider
                    projectConfig={projectConfig}
                    zoom={zoom}
                    undoStackState={{ canRedo: true, canUndo: true }}
                >
                    <h1>This is a test</h1>
                </ShortcutProvider>
            </AppProvider>,
        );
        fireEvent.keyDown(screen.getByText('This is a test'), { key: '-', ctrlKey: true });
        expect(mockSDK.canvas.setZoomPercentage).toHaveBeenCalledWith(zoom * 0.875);
    });
});

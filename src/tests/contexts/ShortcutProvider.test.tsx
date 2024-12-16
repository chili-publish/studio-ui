import EditorSDK from '@chili-publish/studio-sdk';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import ShortcutProvider from '../../contexts/ShortcutManager/ShortcutProvider';
import { ProjectConfig } from '../../types/types';
import AppProvider from '../../contexts/AppProvider';

describe('ShortcutProvider', () => {
    const mockSDK = mock<EditorSDK>();

    mockSDK.undoManager.undo = jest.fn().mockImplementation().mockReturnValue({ success: true, code: 200 });

    mockSDK.undoManager.redo = jest.fn().mockImplementation().mockReturnValue({ success: true, code: 200 });

    mockSDK.canvas.setZoomPercentage = jest.fn().mockImplementation().mockReturnValue({ success: true, code: 200 });

    mockSDK.page.select = jest.fn();

    window.StudioUISDK = mockSDK;
    it('triggers the sandbox toggle shortcut', async () => {
        const user = userEvent.setup();
        const onSandboxModeToggleFn = jest.fn();
        const projectConfig = { onSandboxModeToggle: onSandboxModeToggleFn } as unknown as ProjectConfig;
        render(
            <AppProvider isDocumentLoaded isAnimationPlaying={false}>
                <ShortcutProvider
                    projectConfig={projectConfig}
                    zoom={100}
                    undoStackState={{ canRedo: true, canUndo: true }}
                    pages={[
                        { id: '0', number: 0 },
                        { id: '1', number: 1 },
                    ]}
                    activePageId="0"
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
            <AppProvider isDocumentLoaded isAnimationPlaying={false}>
                <ShortcutProvider
                    projectConfig={projectConfig}
                    zoom={100}
                    undoStackState={{ canRedo: true, canUndo: true }}
                    pages={[
                        { id: '0', number: 0 },
                        { id: '1', number: 1 },
                    ]}
                    activePageId="0"
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
            <AppProvider isDocumentLoaded isAnimationPlaying={false}>
                <ShortcutProvider
                    projectConfig={projectConfig}
                    zoom={100}
                    undoStackState={{ canRedo: true, canUndo: true }}
                    pages={[
                        { id: '0', number: 0 },
                        { id: '1', number: 1 },
                    ]}
                    activePageId="0"
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
            <AppProvider isDocumentLoaded isAnimationPlaying={false}>
                <ShortcutProvider
                    projectConfig={projectConfig}
                    zoom={zoom}
                    undoStackState={{ canRedo: true, canUndo: true }}
                    pages={[
                        { id: '0', number: 0 },
                        { id: '1', number: 1 },
                    ]}
                    activePageId="0"
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
            <AppProvider isDocumentLoaded isAnimationPlaying={false}>
                <ShortcutProvider
                    projectConfig={projectConfig}
                    zoom={zoom}
                    undoStackState={{ canRedo: true, canUndo: true }}
                    pages={[
                        { id: '0', number: 0 },
                        { id: '1', number: 1 },
                    ]}
                    activePageId="0"
                >
                    <h1>This is a test</h1>
                </ShortcutProvider>
            </AppProvider>,
        );
        fireEvent.keyDown(screen.getByText('This is a test'), { key: '-', ctrlKey: true });
        expect(mockSDK.canvas.setZoomPercentage).toHaveBeenCalledWith(zoom * 0.875);
    });
    it('triggers change page on arrow key press hortcut', async () => {
        const projectConfig = {} as unknown as ProjectConfig;
        const user = userEvent.setup();

        render(
            <AppProvider isDocumentLoaded isAnimationPlaying={false}>
                <ShortcutProvider
                    projectConfig={projectConfig}
                    zoom={100}
                    undoStackState={{ canRedo: true, canUndo: true }}
                    pages={[
                        { id: '0', number: 0 },
                        { id: '1', number: 1 },
                    ]}
                    activePageId="0"
                >
                    <h1>This is a test</h1>
                </ShortcutProvider>
            </AppProvider>,
        );
        await user.keyboard('[ArrowRight]');
        expect(mockSDK.page.select).toHaveBeenCalledWith('1');
        await user.keyboard('[ArrowLeft]');
        expect(mockSDK.page.select).toHaveBeenCalledWith('0');
    });
});

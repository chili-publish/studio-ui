import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShortcutProvider from '../../contexts/ShortcutManager/ShortcutProvider';
import { ProjectConfig } from '../../types/types';

describe('ShortcutProvider', () => {
    it('triggers the sandbox toggle shortcut', async () => {
        const user = userEvent.setup();
        const onSandboxModeToggleFn = jest.fn();
        const projectConfig = { onSandboxModeToggle: onSandboxModeToggleFn } as unknown as ProjectConfig;
        render(
            <ShortcutProvider projectConfig={projectConfig}>
                <h1>This is a test</h1>
            </ShortcutProvider>,
        );
        expect(onSandboxModeToggleFn).not.toHaveBeenCalled();
        await user.keyboard('m');
        expect(onSandboxModeToggleFn).toHaveBeenCalled();
    });
});

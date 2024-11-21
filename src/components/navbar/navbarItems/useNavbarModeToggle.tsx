import { Toggle, ToggleOption } from '@chili-publish/grafx-shared-components';
import { ChangeEvent, startTransition, useCallback, useMemo } from 'react';
import { css } from 'styled-components';
import { useAppContext } from '../../../contexts/AppProvider';
import { ProjectConfig } from '../../../types/types';

const options: ToggleOption[] = [
    { id: 'design', label: 'Design' },
    { id: 'run', label: 'Run' },
];

const useNavbarModeToggle = (projectConfig: ProjectConfig) => {
    const { selectedMode, isDocumentLoaded, updateSelectedMode, cleanRunningTasks } = useAppContext();

    const onToggle = useCallback(
        async (ev: ChangeEvent<HTMLInputElement>) => {
            ev.stopPropagation();
            ev.preventDefault();

            updateSelectedMode(ev.target.value);

            await cleanRunningTasks();

            startTransition(() => projectConfig?.onSandboxModeToggle?.());
        },
        [projectConfig, cleanRunningTasks, updateSelectedMode],
    );

    const navbarItem = useMemo(
        () => ({
            label: 'Toggle',
            content: (
                <Toggle
                    disabled={!isDocumentLoaded}
                    onChange={onToggle}
                    checked={selectedMode}
                    options={options}
                    width="9.5rem"
                    height="2rem"
                />
            ),
            styles: css`
                padding-left: 0.125rem;
            `,
        }),
        [isDocumentLoaded, selectedMode, onToggle],
    );

    return {
        modeToggleNavbarItem: navbarItem,
    };
};

export default useNavbarModeToggle;

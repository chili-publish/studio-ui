import { Toggle, ToggleOption } from '@chili-publish/grafx-shared-components';
import { ChangeEvent, useCallback, useMemo } from 'react';
import { css } from 'styled-components';
import { useAppContext } from '../../../contexts/AppProvider';
import { ProjectConfig } from '../../../types/types';

const options: ToggleOption[] = [
    { id: 'design', label: 'Design' },
    { id: 'run', label: 'Run' },
];

const useNavbarModeToggle = (projectConfig: ProjectConfig) => {
    const { selectedMode, updateSelectedMode, cleanRunningTasks } = useAppContext();

    const onToggle = useCallback(
        async (ev: ChangeEvent<HTMLInputElement>) => {
            updateSelectedMode(ev.target.value);

            await cleanRunningTasks();

            projectConfig?.onSandboxModeToggle?.();
        },
        [projectConfig, updateSelectedMode, cleanRunningTasks],
    );

    const navbarItem = useMemo(
        () => ({
            label: 'Toggle',
            content: (
                <Toggle onChange={onToggle} checked={selectedMode} options={options} width="9.5rem" height="2rem" />
            ),
            styles: css`
                padding-left: 0.125rem;
            `,
        }),
        [selectedMode, onToggle],
    );

    return {
        modeToggleNavbarItem: navbarItem,
    };
};

export default useNavbarModeToggle;

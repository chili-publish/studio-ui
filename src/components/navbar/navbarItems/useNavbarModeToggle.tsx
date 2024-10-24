import { Toggle, ToggleOption } from '@chili-publish/grafx-shared-components';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { css } from 'styled-components';
import { ProjectConfig } from '../../../types/types';

type Mode = 'design' | 'run';

const options: ToggleOption[] = [
    { id: 'design', label: 'Design' },
    { id: 'run', label: 'Run' },
];

const useNavbarModeToggle = (projectConfig: ProjectConfig) => {
    const [selectedMode, setSelectedMode] = useState<Mode>('run');

    const onToggle = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            setSelectedMode(ev.target.value as Mode);
            projectConfig?.onSandboxModeToggle?.();
        },
        [projectConfig],
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

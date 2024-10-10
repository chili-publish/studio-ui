import { Toggle, ToggleOption } from '@chili-publish/grafx-shared-components';
import { useMemo, useState } from 'react';

type Mode = 'design' | 'run';

const options: ToggleOption[] = [
    { id: 'design', label: 'Design' },
    { id: 'run', label: 'Run' },
];

const useNavbarModeToggle = () => {
    const [selectedMode, setSelectedMode] = useState<Mode>('run');

    const navbarItem = useMemo(
        () => ({
            label: 'Toggle',
            content: (
                <Toggle
                    onChange={(ev) => setSelectedMode(ev.target.value as Mode)}
                    checked={selectedMode}
                    options={options}
                    width="9.5rem"
                    height="2rem"
                />
            ),
        }),
        [selectedMode],
    );

    return {
        modeToggleNavbarItem: navbarItem,
    };
};

export default useNavbarModeToggle;

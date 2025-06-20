import { AvailableIcons, Select, Tooltip, TooltipPosition } from '@chili-publish/grafx-shared-components';
import { useEffect, useMemo, useState } from 'react';
import { SESSION_USER_INTEFACE_ID_KEY } from '../../../utils/constants';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import { useUserInterfaceDetailsContext } from '../UserInterfaceDetailsContext';
import { UserInterface } from '../../../types/types';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';

const useUserInterfaceSelector = () => {
    const { projectConfig } = useUiConfigContext();
    const [userInterfaces, setUserInterfaces] = useState<UserInterface[]>([]);
    const { selectedUserInterfaceId, onUserInterfaceChange } = useUserInterfaceDetailsContext();

    useEffect(() => {
        if (projectConfig.onFetchUserInterfaces) {
            projectConfig.onFetchUserInterfaces().then((res) => {
                setUserInterfaces(res?.data?.data || []);
            });
        }
    }, [projectConfig]);

    const options = useMemo(
        () => userInterfaces.map((item) => ({ label: item.name, value: item.id })),
        [userInterfaces],
    );
    const validUserInterfaceForTemplate = userInterfaces.find(
        (item) => item.id === sessionStorage.getItem(SESSION_USER_INTEFACE_ID_KEY),
    )?.id;
    const selectedUserInterface =
        validUserInterfaceForTemplate || selectedUserInterfaceId || userInterfaces.find((item) => item.default)?.id;

    const navbarItem = useMemo(
        () => ({
            label: 'UserInterface',
            content: (
                <Tooltip content={'User Interface'} position={TooltipPosition.BOTTOM}>
                    <Select
                        dataId={getDataIdForSUI('dropdown-user-interface')}
                        dataTestId={getDataTestIdForSUI('dropdown-user-interface')}
                        options={options}
                        value={options.find((op) => op.value === selectedUserInterface)}
                        onChange={(option) => {
                            onUserInterfaceChange(option?.value as unknown as string);
                            sessionStorage.setItem(SESSION_USER_INTEFACE_ID_KEY, option?.value as string);
                        }}
                        noDropDownIcon
                        controlShouldRenderValue={false}
                        placeholderIcon={AvailableIcons.faTableLayout}
                        isSearchable={false}
                        useTruncatedOption
                        width="10.875rem"
                    />
                </Tooltip>
            ),
        }),
        [options, selectedUserInterface, onUserInterfaceChange],
    );

    return {
        userInterfaceDropdownNavbarItem: navbarItem,
    };
};

export default useUserInterfaceSelector;

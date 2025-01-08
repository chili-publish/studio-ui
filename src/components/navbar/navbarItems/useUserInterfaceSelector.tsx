import { AvailableIcons, Select } from '@chili-publish/grafx-shared-components';
import { useMemo } from 'react';
import { SESSION_USER_INTEFACE_ID_KEY } from '../../../utils/constants';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';

const useUserInterfaceSelector = () => {
    const { selectedUserInterfaceId, userInterfaces, onUserInterfaceChange } = useUiConfigContext();

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
            ),
        }),
        [options, selectedUserInterface, onUserInterfaceChange],
    );

    return {
        userInterfaceDropdownNavbarItem: navbarItem,
    };
};

export default useUserInterfaceSelector;

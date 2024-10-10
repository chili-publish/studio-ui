import { AvailableIcons, DropDown } from '@chili-publish/grafx-shared-components';
import { useMemo } from 'react';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';

const useUserInterfaceSelector = () => {
    const { selectedUserInterfaceId, userInterfaces, onUserInterfaceChange } = useUiConfigContext();

    const options = useMemo(
        () => userInterfaces.map((item) => ({ label: item.name, value: item.id })),
        [userInterfaces],
    );
    const selectedUserInterface = selectedUserInterfaceId || userInterfaces.find((item) => item.default)?.id;

    const navbarItem = useMemo(
        () => ({
            label: 'UserInterface',
            content: (
                <DropDown
                    dataId={getDataIdForSUI('dropdown-user-interface')}
                    dataTestId={getDataTestIdForSUI('dropdown-user-interface')}
                    options={options}
                    value={options.find((op) => op.value === selectedUserInterface)}
                    onChange={(option) => onUserInterfaceChange(option?.value as unknown as string)}
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

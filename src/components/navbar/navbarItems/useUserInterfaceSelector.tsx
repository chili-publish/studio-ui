import { AvailableIcons, Select, Tooltip, TooltipPosition } from '@chili-publish/grafx-shared-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { APP_WRAPPER_ID, SESSION_USER_INTEFACE_ID_KEY } from '../../../utils/constants';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import { useUserInterfaceDetailsContext } from '../UserInterfaceDetailsContext';
import { UserInterface } from '../../../types/types';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';

const useUserInterfaceSelector = () => {
    const { projectConfig } = useUiConfigContext();
    const [userInterfaces, setUserInterfaces] = useState<UserInterface[]>([]);
    const [validUserInterfaceForTemplate, setValidUserInterfaceForTemplate] = useState<string | null>(null);
    const { selectedUserInterfaceId, onUserInterfaceChange } = useUserInterfaceDetailsContext();

    useEffect(() => {
        projectConfig.onFetchUserInterfaces().then((res) => {
            setUserInterfaces(res.data);
            const interfaceFromSession = sessionStorage.getItem(SESSION_USER_INTEFACE_ID_KEY);
            if (interfaceFromSession) {
                setValidUserInterfaceForTemplate(res.data.find((item) => item.id === interfaceFromSession)?.id || null);
            }
        });
    }, [projectConfig]);

    const options = useMemo(
        () => userInterfaces.map((item) => ({ label: item.name, value: item.id })),
        [userInterfaces],
    );

    const selectedUserInterface = useMemo(
        () =>
            validUserInterfaceForTemplate || selectedUserInterfaceId || userInterfaces.find((item) => item.default)?.id,
        [validUserInterfaceForTemplate, selectedUserInterfaceId, userInterfaces],
    );

    const handleUserInterfaceChange = useCallback(
        (value: string) => {
            onUserInterfaceChange(value);
            sessionStorage.setItem(SESSION_USER_INTEFACE_ID_KEY, value);
            setValidUserInterfaceForTemplate(value);
        },
        [onUserInterfaceChange],
    );

    const navbarItem = useMemo(
        () => ({
            label: 'UserInterface',
            content: (
                <Tooltip content="User Interface" position={TooltipPosition.BOTTOM} anchorId={APP_WRAPPER_ID}>
                    <Select
                        dataId={getDataIdForSUI('dropdown-user-interface')}
                        dataTestId={getDataTestIdForSUI('dropdown-user-interface')}
                        options={options}
                        value={options.find((op) => op.value === selectedUserInterface)}
                        onChange={(option) => {
                            handleUserInterfaceChange(option?.value as string);
                        }}
                        noDropDownIcon
                        controlShouldRenderValue={false}
                        placeholderIcon={AvailableIcons.faTableLayout}
                        isSearchable={false}
                        useTruncatedOption
                        width="10.875rem"
                        anchorId={APP_WRAPPER_ID}
                    />
                </Tooltip>
            ),
        }),
        [options, selectedUserInterface, handleUserInterfaceChange],
    );

    return {
        userInterfaceDropdownNavbarItem: navbarItem,
    };
};

export default useUserInterfaceSelector;

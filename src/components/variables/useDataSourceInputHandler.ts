import { useCallback } from 'react';

interface DataSourceInputHandlerProps {
    requiresUserAuthorizationCheck?: boolean;
    onDataRowsLoad: () => void;
    onRowConfirmed: (_: number) => void;
    onDataSourcePanelOpen: () => void;
    onDataSourcePanelClose: () => void;
}

const useDataSourceInputHandler = ({
    requiresUserAuthorizationCheck,
    onDataRowsLoad,
    onRowConfirmed,
    onDataSourcePanelOpen,
    onDataSourcePanelClose,
}: DataSourceInputHandlerProps) => {
    const onSelectedRowChanged = useCallback(
        (index: number) => {
            onRowConfirmed(index);
            onDataSourcePanelClose();
        },
        [onRowConfirmed, onDataSourcePanelClose],
    );

    const onInputClick = useCallback(() => {
        if (requiresUserAuthorizationCheck) {
            onDataRowsLoad();
        } else {
            onDataSourcePanelOpen();
        }
    }, [requiresUserAuthorizationCheck, onDataRowsLoad, onDataSourcePanelOpen]);

    return {
        onSelectedRowChanged,
        onInputClick,
    };
};

export default useDataSourceInputHandler;

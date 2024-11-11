import { useCallback } from 'react';

interface DataSourceInputHandlerProps {
    currentRow: string;
    onDataRowsLoad: () => void;
    onRowConfirmed: (_: number) => void;
    onDataSourcePanelOpen: () => void;
    onDataSourcePanelClose: () => void;
}

const useDataSourceInputHandler = ({
    currentRow,
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
        if (!currentRow) {
            onDataRowsLoad();
        } else {
            onDataSourcePanelOpen();
        }
    }, [currentRow, onDataRowsLoad, onDataSourcePanelOpen]);

    return {
        onSelectedRowChanged,
        onInputClick,
    };
};

export default useDataSourceInputHandler;

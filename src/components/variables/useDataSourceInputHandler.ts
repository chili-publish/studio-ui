import { useCallback } from 'react';

interface DataSourceInputHandlerProps {
    currentRow: any;
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
    const onSelectedRowConfirmed = useCallback((index: number) => {
        onRowConfirmed(index);
        onDataSourcePanelClose();
    }, []);

    const onInputClick = useCallback(() => {
        if (!currentRow) {
            onDataRowsLoad();
        } else {
            onDataSourcePanelOpen();
        }
    }, [currentRow, onDataRowsLoad, onDataSourcePanelOpen]);

    return {
        onSelectedRowConfirmed,
        onInputClick,
    };
};

export default useDataSourceInputHandler;

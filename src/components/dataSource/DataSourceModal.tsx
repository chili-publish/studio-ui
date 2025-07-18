import { ModalLayout, ModalSize } from '@chili-publish/grafx-shared-components';
import { DataItem } from '@chili-publish/studio-sdk';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import { APP_WRAPPER_ID } from '../../utils/constants';
import { MODAL_ID, ModalStyle } from './DataSourceModal.styles';
import DataSourceTable from './DataSourceTable';

interface TableModalProps {
    isOpen: boolean;
    data: DataItem[];
    error?: string;
    hasMoreData?: boolean;
    dataIsLoading?: boolean;
    onNextPageRequested: () => void;
    onClose: () => void;

    selectedRow: number;
    onSelectedRowChanged: (_: number) => void;
}

function DataSourceModal({
    isOpen,
    data,
    error,
    hasMoreData,
    dataIsLoading,
    onNextPageRequested,
    onClose,
    selectedRow,
    onSelectedRowChanged,
}: TableModalProps) {
    const { getUITranslation } = useUITranslations();

    const title = getUITranslation(['formBuilder', 'datasource', 'header'], 'Data source');

    return (
        <>
            <ModalStyle />
            <ModalLayout.Container
                id={MODAL_ID}
                anchorId={APP_WRAPPER_ID}
                size={ModalSize.L}
                isVisible={isOpen}
                isResizable
                isDraggable
                onClose={onClose}
            >
                <ModalLayout.Title>{title}</ModalLayout.Title>
                <ModalLayout.Body>
                    <DataSourceTable
                        data={data}
                        error={error}
                        hasMoreData={hasMoreData}
                        dataIsLoading={dataIsLoading}
                        selectedRow={selectedRow}
                        onNextPageRequested={onNextPageRequested}
                        onSelectedRowChanged={onSelectedRowChanged}
                    />
                </ModalLayout.Body>
            </ModalLayout.Container>
        </>
    );
}
export default DataSourceModal;

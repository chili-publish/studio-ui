import { ModalLayout, ModalSize } from '@chili-publish/grafx-shared-components';
import { DataItem } from '@chili-publish/studio-sdk';
import { MODAL_ID, ModalStyle } from './DataSourceModal.styles';
import DataSourceTable from './DataSourceTable';
import { APP_WRAPPER_ID } from '../../../utils/constants';

interface TableModalProps {
    title: string;

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

const DataSourceModal = ({
    title,
    isOpen,
    data,
    error,
    hasMoreData,
    dataIsLoading,
    onNextPageRequested,
    onClose,
    selectedRow,
    onSelectedRowChanged,
}: TableModalProps) => {
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
                        hasNextPage={hasMoreData}
                        nextPageLoading={dataIsLoading}
                        selectedRowIndex={selectedRow}
                        onNextPageRequested={onNextPageRequested}
                        onSelectedRowChanged={onSelectedRowChanged}
                    />
                </ModalLayout.Body>
            </ModalLayout.Container>
        </>
    );
};
export default DataSourceModal;

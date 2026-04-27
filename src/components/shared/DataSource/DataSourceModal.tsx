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

    previousPageLoading?: boolean;
    hasPreviousPage?: boolean;
    onPreviousPageRequested?: () => void;

    nextPageLoading?: boolean;
    hasNextPage?: boolean;
    onNextPageRequested: () => void;

    selectedRowIndex?: number;
    selectedRow?: DataItem;
    selectedRowKey?: string;

    onSelectedRowChanged: (_: number) => void;
    onClose: () => void;
}

const DataSourceModal = ({
    title,
    isOpen,
    data,
    error,
    hasPreviousPage,
    hasNextPage,
    previousPageLoading,
    nextPageLoading,
    onPreviousPageRequested,
    onNextPageRequested,
    onClose,
    selectedRow,
    selectedRowIndex,
    selectedRowKey,
    onSelectedRowChanged,
}: TableModalProps) => {
    return (
        <>
            <ModalStyle centerContent={!!error || data.length === 0} />
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
                        hasNextPage={hasNextPage}
                        nextPageLoading={nextPageLoading}
                        hasPreviousPage={hasPreviousPage}
                        previousPageLoading={previousPageLoading}
                        onPreviousPageRequested={onPreviousPageRequested}
                        onNextPageRequested={onNextPageRequested}
                        selectedRowIndex={selectedRowIndex}
                        selectedRow={selectedRow}
                        selectedRowKey={selectedRowKey}
                        onSelectedRowChanged={onSelectedRowChanged}
                    />
                </ModalLayout.Body>
            </ModalLayout.Container>
        </>
    );
};
export default DataSourceModal;

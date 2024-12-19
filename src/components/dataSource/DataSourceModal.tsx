import { ModalLayout, ModalSize } from '@chili-publish/grafx-shared-components';
import { DataItem } from '@chili-publish/studio-sdk';
import { APP_WRAPPER_ID } from '../../utils/constants';
import { MODAL_ID, ModalStyle, TableWrapper } from './DataSourceModal.styles';
import DataSourceTable from './DataSourceTable';

interface TableModalProps {
    isOpen: boolean;
    data: DataItem[];
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
    hasMoreData,
    dataIsLoading,
    onNextPageRequested,
    onClose,
    selectedRow,
    onSelectedRowChanged,
}: TableModalProps) {
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
                <ModalLayout.Title>Data source</ModalLayout.Title>
                <ModalLayout.Body>
                    <TableWrapper>
                        <DataSourceTable
                            data={data}
                            hasMoreData={hasMoreData}
                            dataIsLoading={dataIsLoading}
                            selectedRow={selectedRow}
                            onNextPageRequested={onNextPageRequested}
                            onSelectedRowChanged={onSelectedRowChanged}
                        />
                    </TableWrapper>
                </ModalLayout.Body>
            </ModalLayout.Container>
        </>
    );
}
export default DataSourceModal;

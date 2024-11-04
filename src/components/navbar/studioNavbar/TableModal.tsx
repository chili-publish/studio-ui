import { ModalLayout, ModalSize, Table } from '@chili-publish/grafx-shared-components';
import { LARGE_DATASET } from './data';
import { MODAL_ID, ModalStyle, TableWrapper } from './TableModal.styles';

interface TableModalProps {
    onClose: () => void;
}

function TableModal({ onClose }: TableModalProps) {
    return (
        <>
            <ModalStyle />
            <ModalLayout.Container id={MODAL_ID} size={ModalSize.L} isVisible isResizable onClose={onClose}>
                <ModalLayout.Title>Data source</ModalLayout.Title>
                <ModalLayout.Body>
                    <TableWrapper>
                        <Table rows={LARGE_DATASET} />
                    </TableWrapper>
                </ModalLayout.Body>
            </ModalLayout.Container>
        </>
    );
}
export default TableModal;

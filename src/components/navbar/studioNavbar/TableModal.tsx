import { ModalLayout, ModalSize, Table } from '@chili-publish/grafx-shared-components';
import { LARGE_DATASET } from './data';

interface TableModalProps {
    onClose: () => void;
}

function TableModal({ onClose }: TableModalProps) {
    return (
        <ModalLayout.Container size={ModalSize.L} isVisible isResizable onClose={onClose}>
            <ModalLayout.Title>Datasource</ModalLayout.Title>
            <ModalLayout.Body>
                <Table rows={LARGE_DATASET} />
            </ModalLayout.Body>
        </ModalLayout.Container>
    );
}
export default TableModal;

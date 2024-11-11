import { ModalLayout, ModalSize } from '@chili-publish/grafx-shared-components';
import { MODAL_ID, ModalStyle, TableWrapper } from './DataSourceModal.styles';
import DataSourceTable from './DataSourceTable';
import { DataItem } from './DataSource.types';

interface TableModalProps {
    data: DataItem[];
    hasMoreData?: boolean;
    dataIsLoading?: boolean;
    onNextPageRequested: () => void;
    onClose: () => void;

    selectedRow: number;
    onSelectedRowChanged: (_: number) => void;
}

function DataSourceModal({
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
            <ModalLayout.Container id={MODAL_ID} size={ModalSize.L} isVisible isResizable onClose={onClose}>
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

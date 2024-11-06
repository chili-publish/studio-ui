import { ModalLayout, ModalSize } from '@chili-publish/grafx-shared-components';
import { DataItem } from '@chili-publish/studio-sdk/lib/src/types/DataConnectorTypes';
import { MODAL_ID, ModalStyle, TableWrapper } from './DataSourceModal.styles';
import DataSourceTable from './DataSourceTable';

interface TableModalProps {
    data: DataItem[];
    hasMoreData?: boolean;
    dataIsLoading?: boolean;
    onNextPageRequested: () => void;
    onClose: () => void;

    selectedRow: number;
    onSelectedRowConfirmed: (_: number) => void;
}

function DataSourceModal({
    data,
    hasMoreData,
    dataIsLoading,
    onNextPageRequested,
    onClose,
    selectedRow,
    onSelectedRowConfirmed,
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
                            onSelectedRowChanged={onSelectedRowConfirmed}
                        />
                    </TableWrapper>
                </ModalLayout.Body>
            </ModalLayout.Container>
        </>
    );
}
export default DataSourceModal;

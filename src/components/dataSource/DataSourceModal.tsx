import { ModalLayout, ModalSize, Select } from '@chili-publish/grafx-shared-components';
import { DataItem } from '@chili-publish/studio-sdk';
import { useMemo } from 'react';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import { APP_WRAPPER_ID } from '../../utils/constants';
import { MODAL_ID, ModalStyle, PageSizeToolbar } from './DataSourceModal.styles';
import DataSourceTable from './DataSourceTable';
import { useUserInterfaceDetailsContext } from '../navbar/UserInterfaceDetailsContext';
import { PAGE_SIZE } from './useDataSource';

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
    pageSize: number;
    onPageSizeChanged: (pageSize: number) => void;
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
    pageSize,
    onPageSizeChanged,
}: TableModalProps) {
    const { getUITranslation } = useUITranslations();
    const { formBuilder } = useUserInterfaceDetailsContext();

    const title = getUITranslation(
        ['formBuilder', 'datasource', 'header'],
        formBuilder.datasource?.header ?? 'Data source',
    );

    const pageSizeOptions = useMemo(
        () => [
            { value: PAGE_SIZE, label: PAGE_SIZE.toString() },
            { value: 100, label: '100' },
            { value: 500, label: '500' },
            { value: 1000, label: '1000' },
        ],
        [],
    );

    const selectedPageSizeOption = useMemo(
        () => pageSizeOptions.find((option) => option.value === pageSize) ?? pageSizeOptions[0],
        [pageSize, pageSizeOptions],
    );

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
                    <PageSizeToolbar>
                        <Select
                            options={pageSizeOptions}
                            value={selectedPageSizeOption}
                            onChange={(option) => {
                                if (option && !Array.isArray(option) && option.value) {
                                    onPageSizeChanged(option.value as number);
                                }
                            }}
                            label="Page size"
                        />
                    </PageSizeToolbar>
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

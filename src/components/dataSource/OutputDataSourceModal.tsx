import { DataItem } from '@chili-publish/studio-sdk';
import { useUITranslations } from '../../core/hooks/useUITranslations';
import { useUserInterfaceDetailsContext } from '../navbar/UserInterfaceDetailsContext';
import DataSourceModal from '../shared/DataSource/DataSourceModal';

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

const OutputDataSourceModal = ({
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
    const { getUITranslation } = useUITranslations();
    const { formBuilder } = useUserInterfaceDetailsContext();

    const title = getUITranslation(
        ['formBuilder', 'datasource', 'header'],
        formBuilder.datasource?.header ?? 'Data source',
    );

    return (
        <DataSourceModal
            title={title}
            isOpen={isOpen}
            data={data}
            error={error}
            hasNextPage={hasMoreData}
            nextPageLoading={dataIsLoading}
            onNextPageRequested={onNextPageRequested}
            selectedRowIndex={selectedRow}
            onSelectedRowChanged={onSelectedRowChanged}
            onClose={onClose}
        />
    );
};
export default OutputDataSourceModal;

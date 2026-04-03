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
            hasMoreData={hasMoreData}
            dataIsLoading={dataIsLoading}
            onNextPageRequested={onNextPageRequested}
            onClose={onClose}
            selectedRow={selectedRow}
            onSelectedRowChanged={onSelectedRowChanged}
        />
    );
};
export default OutputDataSourceModal;

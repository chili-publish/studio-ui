import { useUITranslations } from '../../core/hooks/useUITranslations';
import DataSourceInput from '../shared/DataSource/DataSourceInput';

interface DataSourceInputProps {
    currentRow: string;
    currentRowIndex: number;
    dataIsLoading: boolean;
    isEmptyState: boolean;

    isNextDisabled: boolean;
    isPrevDisabled: boolean;

    onInputClick: (_: React.MouseEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => void;
    onPrevClick: () => void;
    onNextClick: () => void;
}
const OutputDataSourceInput = ({
    currentRow,
    currentRowIndex,
    dataIsLoading,
    isEmptyState,
    isPrevDisabled,
    isNextDisabled,
    onInputClick,
    onPrevClick,
    onNextClick,
}: DataSourceInputProps) => {
    const { getUITranslation } = useUITranslations();
    const inputLabel = getUITranslation(['formBuilder', 'datasource', 'inputLabel'], 'Data row');
    const rowLabel = getUITranslation(['formBuilder', 'datasource', 'row'], 'Row');
    return (
        <DataSourceInput
            currentRow={currentRow}
            currentRowIndex={currentRowIndex}
            dataIsLoading={dataIsLoading}
            isEmptyState={isEmptyState}
            isNextDisabled={isNextDisabled}
            isPrevDisabled={isPrevDisabled}
            onInputClick={onInputClick}
            onPrevClick={onPrevClick}
            onNextClick={onNextClick}
            isDataRowIndexHidden={false}
            labels={{ input: inputLabel, row: rowLabel }}
        />
    );
};

export default OutputDataSourceInput;

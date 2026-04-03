import {
    AvailableIcons,
    Button,
    ButtonVariant,
    Icon,
    Input,
    Label,
    LoadingIcon,
} from '@chili-publish/grafx-shared-components';
import { useDirection } from '../../../hooks/useDirection';
import { Text } from '../../../styles/Main.styles';
import { DATA_SOURCE_ID, DataSourceInputStyle, RowInfoContainer } from './DataSource.styles';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';

interface DataSourceInputProps {
    currentRow: string;
    currentRowIndex?: number;
    dataIsLoading: boolean;
    isEmptyState: boolean;

    isNextDisabled: boolean;
    isPrevDisabled: boolean;
    isDataRowIndexHidden: boolean;

    onInputClick: (_: React.MouseEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => void;
    onPrevClick: () => void;
    onNextClick: () => void;

    labels: {
        input: string;
        row?: string;
    };
}
const DataSourceInput = ({
    currentRow,
    currentRowIndex,
    dataIsLoading,
    isEmptyState,
    isDataRowIndexHidden,
    isPrevDisabled,
    isNextDisabled,
    onInputClick,
    onPrevClick,
    onNextClick,
    labels,
}: DataSourceInputProps) => {
    const { direction } = useDirection();

    return (
        <>
            <DataSourceInputStyle disabled={dataIsLoading} />
            <Input
                type="text"
                readOnly
                disabled={dataIsLoading}
                dataId={DATA_SOURCE_ID}
                dataTestId={getDataTestIdForSUI(`data-source-input`)}
                dataIntercomId="data-source-input"
                name="data-source-input"
                value={currentRow}
                placeholder="Select data row"
                label={<Label translationKey="dataRow" value={labels.input} />}
                onClick={onInputClick}
                rightIcon={{
                    label: '',
                    icon: dataIsLoading ? (
                        <LoadingIcon />
                    ) : (
                        <Icon
                            dataId={getDataIdForSUI('data-source-input-icon')}
                            dataTestId={getDataTestIdForSUI('data-source-input-icon')}
                            icon={AvailableIcons.faTable}
                        />
                    ),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick: onInputClick as any,
                }}
            />

            {!isEmptyState && (
                <RowInfoContainer data-testid={getDataTestIdForSUI('data-row-info')}>
                    <Button
                        variant={ButtonVariant.tertiary}
                        onClick={onPrevClick}
                        disabled={isPrevDisabled}
                        dataId={getDataIdForSUI('data-row-prev')}
                        dataTestId={getDataTestIdForSUI('data-row-prev')}
                        icon={
                            <Icon
                                icon={direction === 'rtl' ? AvailableIcons.faArrowRight : AvailableIcons.faArrowLeft}
                                key="data-source-navigation-arrow-left"
                            />
                        }
                    />
                    {!isDataRowIndexHidden && currentRowIndex !== undefined && (
                        <Text>{currentRow ? `${labels.row} ${currentRowIndex + 1}` : ''}</Text>
                    )}
                    <Button
                        variant={ButtonVariant.tertiary}
                        onClick={onNextClick}
                        disabled={isNextDisabled}
                        dataId={getDataIdForSUI('data-row-next')}
                        dataTestId={getDataTestIdForSUI('data-row-next')}
                        icon={
                            <Icon
                                icon={direction === 'rtl' ? AvailableIcons.faArrowLeft : AvailableIcons.faArrowRight}
                                key="data-source-navigation-arrow-right"
                            />
                        }
                    />
                </RowInfoContainer>
            )}
        </>
    );
};

export default DataSourceInput;

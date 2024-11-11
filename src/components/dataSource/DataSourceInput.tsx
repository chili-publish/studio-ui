import {
    AvailableIcons,
    Button,
    ButtonVariant,
    Icon,
    Input,
    Label,
    LoadingIcon,
    useTheme,
} from '@chili-publish/grafx-shared-components';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { RowInfoContainer } from './DataSource.styles';
import { Text } from '../../styles/Main.styles';

interface DataSourceInputProps {
    currentRow: string;
    currentRowIndex: number;
    dataIsLoading: boolean;

    isNextDisabled: boolean;
    isPrevDisabled: boolean;

    onInputClick: () => void;
    onPrevClick: () => void;
    onNextClick: () => void;
}
function DataSourceInput({
    currentRow,
    currentRowIndex,
    dataIsLoading,
    isPrevDisabled,
    isNextDisabled,
    onInputClick,
    onPrevClick,
    onNextClick,
}: DataSourceInputProps) {
    const { icon, mode } = useTheme();
    return (
        <>
            <Input
                type="text"
                readOnly
                disabled={dataIsLoading}
                dataId={getDataIdForSUI(`data-source-input`)}
                dataTestId={getDataTestIdForSUI(`data-source-input`)}
                dataIntercomId="data-source-input"
                name="data-source-input"
                value={currentRow}
                placeholder="Select data row"
                label={<Label translationKey="dataRow" value="Data row" />}
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
                    onClick: onInputClick,
                }}
            />

            <RowInfoContainer iconStyle={icon}>
                <Button
                    variant={ButtonVariant.tertiary}
                    onClick={onPrevClick}
                    disabled={isPrevDisabled}
                    dataId={getDataIdForSUI('data-row-prev')}
                    dataTestId={getDataTestIdForSUI('data-row-prev')}
                    icon={<Icon icon={AvailableIcons.faArrowLeft} key="data-source-navigation-arrow-left" />}
                />
                <Text mode={mode}>{currentRow ? `Row ${currentRowIndex + 1}` : ''}</Text>
                <Button
                    variant={ButtonVariant.tertiary}
                    onClick={onNextClick}
                    disabled={isNextDisabled}
                    dataId={getDataIdForSUI('data-row-next')}
                    dataTestId={getDataTestIdForSUI('data-row-next')}
                    icon={<Icon icon={AvailableIcons.faArrowRight} key="data-source-navigation-arrow-right" />}
                />
            </RowInfoContainer>
        </>
    );
}

export default DataSourceInput;
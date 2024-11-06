import {
    AvailableIcons,
    GraFxIcon,
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
                <GraFxIcon
                    id="prev-icon"
                    icon={AvailableIcons.faArrowLeft}
                    onClick={onPrevClick}
                    disabled={isPrevDisabled}
                />
                <Text mode={mode}>{currentRow ? `Row ${currentRowIndex + 1}` : ''}</Text>
                <GraFxIcon
                    id="next-icon"
                    icon={AvailableIcons.faArrowRight}
                    onClick={onNextClick}
                    disabled={isNextDisabled}
                />
            </RowInfoContainer>
        </>
    );
}

export default DataSourceInput;

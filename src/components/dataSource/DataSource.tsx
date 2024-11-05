import {
    AvailableIcons,
    GraFxIcon,
    Icon,
    Input,
    Label,
    LoadingIcon,
    useTheme,
} from '@chili-publish/grafx-shared-components';
import { PanelTitle } from '../shared/Panel.styles';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../utils/dataIds';
import { RowInfoContainer } from './DataSource.styles';
import useDataSource from './useDataSource';
import { Text } from '../../styles/Main.styles';

function DataSource() {
    const { panel, icon, mode } = useTheme();
    const {
        currentRow,
        currentRowIndex,
        isLoading,
        isPrevDisabled,
        isNextDisabled,
        loadDataRow,
        getPreviousRow,
        getNextRow,
    } = useDataSource();

    return currentRow ? (
        <>
            <PanelTitle panelTheme={panel}>Data source</PanelTitle>
            <Input
                type="text"
                readOnly
                disabled={isLoading}
                dataId={getDataIdForSUI(`data-source-input`)}
                dataTestId={getDataTestIdForSUI(`data-source-input`)}
                dataIntercomId="data-source-input"
                name="data-source-input"
                value={currentRow}
                placeholder="Select data row"
                label={<Label translationKey="dataRow" value="Data row" />}
                onClick={loadDataRow}
                rightIcon={{
                    label: '',
                    icon: isLoading ? (
                        <LoadingIcon />
                    ) : (
                        <Icon
                            dataId={getDataIdForSUI('data-source-input-icon')}
                            dataTestId={getDataTestIdForSUI('data-source-input-icon')}
                            icon={AvailableIcons.faTable}
                        />
                    ),
                    onClick: () => null,
                }}
            />

            <RowInfoContainer iconStyle={icon}>
                <GraFxIcon
                    id="prev-icon"
                    icon={AvailableIcons.faArrowLeft}
                    onClick={getPreviousRow}
                    disabled={isPrevDisabled}
                />
                <Text mode={mode}>{`Row ${currentRowIndex + 1}`}</Text>
                <GraFxIcon icon={AvailableIcons.faArrowRight} onClick={getNextRow} disabled={isNextDisabled} />
            </RowInfoContainer>
        </>
    ) : null;
}

export default DataSource;

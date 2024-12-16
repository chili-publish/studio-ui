import {
    AvailableIcons,
    Button,
    ButtonVariant,
    FontSizes,
    Icon,
    Tray,
    useTheme,
} from '@chili-publish/grafx-shared-components';
import { Variable } from '@chili-publish/studio-sdk';
import { useCallback, useState } from 'react';
import { css } from 'styled-components';
import { useFeatureFlagContext } from '../../contexts/FeatureFlagProvider';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import { APP_WRAPPER_ID } from '../../utils/constants';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import DataSourceInput from '../dataSource/DataSourceInput';
import DataSourceTable from '../dataSource/DataSourceTable';
import useDataSource from '../dataSource/useDataSource';
import ImagePanel from '../imagePanel/ImagePanel';
import { DataSourceTableWrapper, dataSourceTrayStyles, TrayStyle } from './MobileTray.styles';
import MobileTrayHeader from './MobileTrayHeader';
import MobileVariablesList from './MobileVariablesList';
import useDataSourceInputHandler from './useDataSourceInputHandler';
import { EditButtonWrapper, TrayPanelTitle, VariablesContainer } from './VariablesPanel.styles';

interface VariablesPanelProps {
    variables: Variable[];
    isTimelineDisplayed?: boolean;
    isPagesPanelDisplayed?: boolean;
    isDocumentLoaded: boolean;
}

const MEDIA_PANEL_TOOLBAR_HEIGHT_REM = '3rem';

const imagePanelHeight = `
    calc(100%
        - ${MEDIA_PANEL_TOOLBAR_HEIGHT_REM}
    )`;

function MobileVariablesPanel(props: VariablesPanelProps) {
    const { variables, isDocumentLoaded, isTimelineDisplayed, isPagesPanelDisplayed } = props;
    const { panel } = useTheme();

    const { contentType, showVariablesPanel, showDataSourcePanel } = useVariablePanelContext();
    const { featureFlags } = useFeatureFlagContext();

    const [isTrayVisible, setIsTrayVisible] = useState<boolean>(false);
    const [mobileOptionsListOpen, setMobileOptionsListOpen] = useState(false);

    const {
        currentInputRow,
        currentRowIndex,
        updateSelectedRow,
        isLoading,
        dataRows,
        hasMoreRows,
        isPrevDisabled,
        isNextDisabled,
        loadDataRows,
        getPreviousRow,
        getNextRow,
        hasDataConnector,
    } = useDataSource(isDocumentLoaded);

    const { onInputClick, onSelectedRowChanged } = useDataSourceInputHandler({
        onDataRowsLoad: loadDataRows,
        onRowConfirmed: updateSelectedRow,
        currentRow: currentInputRow,
        onDataSourcePanelOpen: showDataSourcePanel,
        onDataSourcePanelClose: showVariablesPanel,
    });

    const closeTray = () => setIsTrayVisible(false);

    const isVariablesListOpen = contentType === ContentType.VARIABLES_LIST;
    const isDateVariablePanelOpen = contentType === ContentType.DATE_VARIABLE_PICKER;
    const isImageBrowsePanelOpen = contentType === ContentType.IMAGE_PANEL;
    const isDataSourcePanelOpen = contentType === ContentType.DATA_SOURCE_TABLE;

    const isDataSourceInputShown =
        hasDataConnector &&
        contentType !== ContentType.DATA_SOURCE_TABLE &&
        contentType !== ContentType.DATE_VARIABLE_PICKER &&
        contentType !== ContentType.IMAGE_PANEL &&
        !mobileOptionsListOpen;

    const showImagePanel = !(isVariablesListOpen || isDateVariablePanelOpen);

    const onTrayHidden = useCallback(() => {
        showVariablesPanel();
        setIsTrayVisible(false);
    }, [showVariablesPanel]);

    return (
        <>
            <EditButtonWrapper isTimelineDisplayed={isTimelineDisplayed} isPagesPanelDisplayed={isPagesPanelDisplayed}>
                <Button
                    dataTestId={getDataTestIdForSUI('mobile-variables')}
                    variant={ButtonVariant.primary}
                    icon={<Icon key="icon-edit-variable" icon={AvailableIcons.faPen} height="1.125rem" />}
                    onClick={() => setIsTrayVisible(true)}
                    styles={css`
                        padding: 0.9375rem;
                        font-size: ${FontSizes.regular};
                        border-radius: 50%;

                        svg {
                            width: 1.125rem !important;
                        }
                    `}
                />
            </EditButtonWrapper>
            {isDataSourcePanelOpen ? <TrayStyle /> : null}
            <Tray
                isOpen={isTrayVisible}
                anchorId={APP_WRAPPER_ID}
                close={closeTray}
                title={<MobileTrayHeader hasDataConnector={hasDataConnector} mobileListOpen={mobileOptionsListOpen} />}
                onTrayHidden={onTrayHidden}
                hideCloseButton={mobileOptionsListOpen}
                styles={css`
                    height: ${contentType === ContentType.IMAGE_PANEL ? 'calc(100% - 4rem)' : 'auto'};
                    overflow: ${isVariablesListOpen ? 'auto' : 'hidden'};
                    ${contentType === ContentType.IMAGE_PANEL && `padding-bottom: 0`};
                    ${isDataSourcePanelOpen && dataSourceTrayStyles}
                    &::-webkit-scrollbar {
                        width: 0;
                    }
                `}
            >
                <VariablesContainer height={showImagePanel ? imagePanelHeight : undefined}>
                    {isDataSourceInputShown && featureFlags?.STUDIO_DATA_SOURCE ? (
                        <DataSourceInput
                            currentRow={currentInputRow}
                            currentRowIndex={currentRowIndex}
                            dataIsLoading={isLoading}
                            isPrevDisabled={isPrevDisabled}
                            isNextDisabled={isNextDisabled}
                            onInputClick={onInputClick}
                            onPrevClick={getPreviousRow}
                            onNextClick={getNextRow}
                        />
                    ) : null}
                    {(isVariablesListOpen || isDateVariablePanelOpen) && (
                        <>
                            {hasDataConnector && isVariablesListOpen && !mobileOptionsListOpen ? (
                                <TrayPanelTitle panelTheme={panel}>Customize</TrayPanelTitle>
                            ) : null}
                            <MobileVariablesList
                                variables={variables}
                                isDocumentLoaded={isDocumentLoaded}
                                onMobileOptionListToggle={setMobileOptionsListOpen}
                            />
                        </>
                    )}
                    {isImageBrowsePanelOpen && <ImagePanel />}
                </VariablesContainer>
                {isDataSourcePanelOpen && (
                    <DataSourceTableWrapper>
                        <DataSourceTable
                            data={dataRows}
                            hasMoreData={hasMoreRows}
                            dataIsLoading={isLoading}
                            selectedRow={currentRowIndex}
                            onNextPageRequested={loadDataRows}
                            onSelectedRowChanged={onSelectedRowChanged}
                        />
                    </DataSourceTableWrapper>
                )}
            </Tray>
        </>
    );
}

export default MobileVariablesPanel;

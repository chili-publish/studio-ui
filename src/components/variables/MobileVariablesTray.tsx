import { Tray } from '@chili-publish/grafx-shared-components';
import { Layout, LayoutListItemType, LayoutPropertiesType, PageSize, Variable } from '@chili-publish/studio-sdk';
import { useCallback, useMemo, useState } from 'react';
import { css } from 'styled-components';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import { MobileTrayFormBuilderHeader, UiOptions } from '../../types/types';
import { APP_WRAPPER_ID } from '../../utils/constants';
import { getDataTestIdForSUI } from '../../utils/dataIds';
import DataSourceInput from '../dataSource/DataSourceInput';
import DataSourceTable from '../dataSource/DataSourceTable';
import useDataSource from '../dataSource/useDataSource';
import ImagePanel from '../imagePanel/ImagePanel';
import AvailableLayouts from '../layout-panels/leftPanel/AvailableLayouts';
import LayoutProperties from '../LayoutPanel/LayoutProperties';
import { DataSourceTableWrapper, dataSourceTrayStyles, TrayStyle } from './MobileTray.styles';
import MobileTrayHeader from './MobileTrayHeader';
import MobileVariablesList from './MobileVariablesList';
import useDataSourceInputHandler from './useDataSourceInputHandler';
import { ListWrapper, TrayPanelTitle, VariablesContainer } from './VariablesPanel.styles';
import { useLayoutSection } from '../../core/hooks/useLayoutSection';
import { SectionHelpText, SectionWrapper } from '../shared/Panel.styles';
import { TOAST_ID } from '../../contexts/NotificantionManager/Notification.types';
import { useUserInterfaceDetailsContext } from '../navbar/UserInterfaceDetailsContext';

interface VariablesPanelProps {
    isTrayVisible: boolean;
    setIsTrayVisible: (_: boolean) => void;

    variables: Variable[];
    selectedLayout: Layout | null;
    layouts: LayoutListItemType[];
    layoutPropertiesState: LayoutPropertiesType;
    pageSize?: PageSize;
    layoutSectionUIOptions: UiOptions['layoutSection'] & { visible: boolean };
}

const MEDIA_PANEL_TOOLBAR_HEIGHT_REM = '3rem';

const imagePanelHeight = `
    calc(100%
        - ${MEDIA_PANEL_TOOLBAR_HEIGHT_REM}
    )`;

function MobileVariablesPanel(props: VariablesPanelProps) {
    const {
        isTrayVisible,
        setIsTrayVisible,
        variables,
        selectedLayout,
        layouts,
        layoutPropertiesState,
        pageSize,
        layoutSectionUIOptions,
    } = props;

    const { contentType, showVariablesPanel, showDataSourcePanel } = useVariablePanelContext();
    const { formBuilder } = useUserInterfaceDetailsContext();
    const [variablesMobileOptionsListOpen, setVariablesMobileOptionsListOpen] = useState(false);
    const [layoutsMobileOptionsListOpen, setLayoutsMobileOptionsListOpen] = useState(false);

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
        requiresUserAuthorizationCheck,
        error,
    } = useDataSource();

    const { onInputClick, onSelectedRowChanged } = useDataSourceInputHandler({
        requiresUserAuthorizationCheck,
        onDataRowsLoad: loadDataRows,
        onRowConfirmed: updateSelectedRow,
        onDataSourcePanelOpen: showDataSourcePanel,
        onDataSourcePanelClose: showVariablesPanel,
    });

    const closeTray = () => setIsTrayVisible(false);
    const {
        availableLayouts,
        isLayoutSwitcherVisible,
        isAvailableLayoutsDisplayed,
        sectionTitle,
        isLayoutResizableVisible,
        helpText,
    } = useLayoutSection({
        layouts,
        selectedLayout,
        layoutSectionUIOptions,
    });
    const isDateVariablePanelOpen = contentType === ContentType.DATE_VARIABLE_PICKER;
    const isImageBrowsePanelOpen = contentType === ContentType.IMAGE_PANEL;
    const isDataSourcePanelOpen = contentType === ContentType.DATA_SOURCE_TABLE;
    const isDefaultPanelView = !(isDateVariablePanelOpen || isImageBrowsePanelOpen || isDataSourcePanelOpen);

    const mobileOptionListOpen = variablesMobileOptionsListOpen || layoutsMobileOptionsListOpen;

    const isDataSourceDisplayed = formBuilder.datasource.active && hasDataConnector && !mobileOptionListOpen;

    const isAvailableLayoutSubtitleDisplayed = isDataSourceDisplayed;

    const isCustomizeSubtitleDisplayed = isDataSourceDisplayed || isAvailableLayoutsDisplayed;

    const showImagePanel = !(isDefaultPanelView || isDateVariablePanelOpen);

    const onTrayHidden = useCallback(() => {
        showVariablesPanel();
        setIsTrayVisible(false);
        setLayoutsMobileOptionsListOpen(false);
    }, [showVariablesPanel, setIsTrayVisible]);

    const trayHeaderData: MobileTrayFormBuilderHeader = useMemo(
        () => ({
            layouts: {
                title: sectionTitle,
                helpText,
            },
            datasource: {
                title: formBuilder.datasource?.header,
                helpText: formBuilder.datasource?.helpText,
            },
            variables: {
                title: formBuilder.variables.header,
                helpText: formBuilder.variables.helpText,
            },
        }),
        [
            sectionTitle,
            helpText,
            formBuilder.datasource?.header,
            formBuilder.datasource?.helpText,
            formBuilder.variables.header,
            formBuilder.variables.helpText,
        ],
    );

    return (
        <>
            {isDataSourcePanelOpen ? <TrayStyle /> : null}
            <Tray
                dataTestId={getDataTestIdForSUI('tray-panel')}
                isOpen={isTrayVisible}
                anchorId={APP_WRAPPER_ID}
                close={closeTray}
                title={
                    <MobileTrayHeader
                        trayHeaderData={trayHeaderData}
                        isDefaultPanelView={isDefaultPanelView}
                        isDataSourceDisplayed={isDataSourceDisplayed || false}
                        isAvailableLayoutsDisplayed={isAvailableLayoutsDisplayed}
                        mobileListOpen={variablesMobileOptionsListOpen}
                    />
                }
                onTrayHidden={onTrayHidden}
                hideCloseButton={variablesMobileOptionsListOpen || layoutsMobileOptionsListOpen}
                styles={css`
                    height: ${contentType === ContentType.IMAGE_PANEL ? 'calc(100% - 4rem)' : 'auto'};
                    overflow: ${isDefaultPanelView ? 'auto' : 'hidden'};
                    ${contentType === ContentType.IMAGE_PANEL && `padding-bottom: 0`};
                    ${isDataSourcePanelOpen && dataSourceTrayStyles}
                    &::-webkit-scrollbar {
                        width: 0;
                    }
                `}
                ignoreCloseOnParentId={TOAST_ID}
            >
                <VariablesContainer height={showImagePanel ? imagePanelHeight : undefined}>
                    {(isDefaultPanelView || isDateVariablePanelOpen) && (
                        <>
                            {formBuilder.datasource.active && isDataSourceDisplayed && !isDateVariablePanelOpen ? (
                                <DataSourceInput
                                    currentRow={currentInputRow}
                                    currentRowIndex={currentRowIndex}
                                    dataIsLoading={isLoading}
                                    isEmptyState={!!error || dataRows.length === 0}
                                    isPrevDisabled={isPrevDisabled}
                                    isNextDisabled={isNextDisabled}
                                    onInputClick={onInputClick}
                                    onPrevClick={getPreviousRow}
                                    onNextClick={getNextRow}
                                />
                            ) : null}
                            {isAvailableLayoutsDisplayed && !isDateVariablePanelOpen && (
                                <>
                                    {isAvailableLayoutSubtitleDisplayed && (
                                        <SectionWrapper>
                                            <TrayPanelTitle margin="0">{sectionTitle}</TrayPanelTitle>
                                            {helpText && <SectionHelpText>{helpText}</SectionHelpText>}
                                        </SectionWrapper>
                                    )}
                                    {isLayoutSwitcherVisible && (
                                        <ListWrapper optionsListOpen={layoutsMobileOptionsListOpen}>
                                            <AvailableLayouts
                                                selectedLayout={selectedLayout}
                                                availableForUserLayouts={availableLayouts}
                                                mobileDevice
                                                onMobileOptionListToggle={setLayoutsMobileOptionsListOpen}
                                            />
                                        </ListWrapper>
                                    )}
                                    {isLayoutResizableVisible && !layoutsMobileOptionsListOpen && (
                                        <LayoutProperties layout={layoutPropertiesState} pageSize={pageSize} />
                                    )}
                                </>
                            )}

                            {!layoutsMobileOptionsListOpen && formBuilder.variables.active && (
                                <>
                                    {isCustomizeSubtitleDisplayed && (
                                        <SectionWrapper id="variables-section-header">
                                            <TrayPanelTitle margin="0">{formBuilder.variables?.header}</TrayPanelTitle>
                                            {formBuilder.variables?.helpText && (
                                                <SectionHelpText>{formBuilder.variables?.helpText}</SectionHelpText>
                                            )}
                                        </SectionWrapper>
                                    )}
                                    <MobileVariablesList
                                        variables={variables}
                                        onMobileOptionListToggle={setVariablesMobileOptionsListOpen}
                                    />
                                </>
                            )}
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

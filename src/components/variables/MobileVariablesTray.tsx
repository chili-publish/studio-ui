import { AvailableIcons, Button, ButtonVariant, FontSizes, Icon, Tray } from '@chili-publish/grafx-shared-components';
import { Layout, LayoutListItemType, LayoutPropertiesType, PageSize, Variable } from '@chili-publish/studio-sdk';
import { useCallback, useMemo, useState } from 'react';
import { css } from 'styled-components';
import { useFeatureFlagContext } from '../../contexts/FeatureFlagProvider';
import { useVariablePanelContext } from '../../contexts/VariablePanelContext';
import { ContentType } from '../../contexts/VariablePanelContext.types';
import { UiOptions } from '../../types/types';
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
import { EditButtonWrapper, ListWrapper, TrayPanelTitle, VariablesContainer } from './VariablesPanel.styles';

interface VariablesPanelProps {
    variables: Variable[];
    selectedLayout: Layout | null;
    layouts: LayoutListItemType[];
    layoutPropertiesState: LayoutPropertiesType;
    pageSize?: PageSize;
    layoutSectionUIOptions: Required<Required<UiOptions>['layoutSection']> & { visible: boolean };

    isTimelineDisplayed?: boolean;
    isPagesPanelDisplayed?: boolean;
}

const MEDIA_PANEL_TOOLBAR_HEIGHT_REM = '3rem';

const imagePanelHeight = `
    calc(100%
        - ${MEDIA_PANEL_TOOLBAR_HEIGHT_REM}
    )`;

function MobileVariablesPanel(props: VariablesPanelProps) {
    const {
        variables,
        selectedLayout,
        layouts,
        isTimelineDisplayed,
        isPagesPanelDisplayed,
        layoutPropertiesState,
        pageSize,
        layoutSectionUIOptions,
    } = props;
    const availableLayouts = useMemo(() => layouts.filter((item) => item.availableForUser), [layouts]);

    const { contentType, showVariablesPanel, showDataSourcePanel } = useVariablePanelContext();
    const { featureFlags } = useFeatureFlagContext();

    const [isTrayVisible, setIsTrayVisible] = useState<boolean>(false);
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

    const isDateVariablePanelOpen = contentType === ContentType.DATE_VARIABLE_PICKER;
    const isImageBrowsePanelOpen = contentType === ContentType.IMAGE_PANEL;
    const isDataSourcePanelOpen = contentType === ContentType.DATA_SOURCE_TABLE;
    const isDefaultPanelView = !(isDateVariablePanelOpen || isImageBrowsePanelOpen || isDataSourcePanelOpen);

    const mobileOptionListOpen = variablesMobileOptionsListOpen || layoutsMobileOptionsListOpen;

    const isDataSourceDisplayed = featureFlags?.studioDataSource && hasDataConnector && !mobileOptionListOpen;

    const hasAvailableLayouts = useMemo(() => availableLayouts.length >= 2, [availableLayouts]);

    const isLayoutResizable = useMemo(() => selectedLayout?.resizableByUser.enabled ?? false, [selectedLayout]);

    const isLayoutSwitcherVisible = hasAvailableLayouts && layoutSectionUIOptions.layoutSwitcherVisible;
    const isLayoutResizableVisible = isLayoutResizable;

    const isAvailableLayoutsDisplayed =
        layoutsMobileOptionsListOpen ||
        (layoutSectionUIOptions.visible &&
            (isLayoutSwitcherVisible || isLayoutResizableVisible) &&
            !variablesMobileOptionsListOpen);
    const isAvailableLayoutSubtitleDisplayed = isDataSourceDisplayed;

    const isCustomizeSubtitleDisplayed = isDataSourceDisplayed || isAvailableLayoutsDisplayed;

    const showImagePanel = !(isDefaultPanelView || isDateVariablePanelOpen);

    const onTrayHidden = useCallback(() => {
        showVariablesPanel();
        setIsTrayVisible(false);
        setLayoutsMobileOptionsListOpen(false);
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
                dataTestId={getDataTestIdForSUI('tray-panel')}
                isOpen={isTrayVisible}
                anchorId={APP_WRAPPER_ID}
                close={closeTray}
                title={
                    <MobileTrayHeader
                        layoutSectionTitle={layoutSectionUIOptions.title}
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
            >
                <VariablesContainer height={showImagePanel ? imagePanelHeight : undefined}>
                    {(isDefaultPanelView || isDateVariablePanelOpen) && (
                        <>
                            {isDataSourceDisplayed && !isDateVariablePanelOpen ? (
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
                                        <TrayPanelTitle>{layoutSectionUIOptions.title}</TrayPanelTitle>
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
                                    {isLayoutResizable && !layoutsMobileOptionsListOpen && (
                                        <LayoutProperties layout={layoutPropertiesState} pageSize={pageSize} />
                                    )}
                                </>
                            )}

                            {!layoutsMobileOptionsListOpen && (
                                <>
                                    {isCustomizeSubtitleDisplayed && <TrayPanelTitle>Customize</TrayPanelTitle>}
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

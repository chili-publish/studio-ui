import {
    AvailableIcons,
    AvailableIconsType,
    Button,
    ButtonVariant,
    Icon,
    Modal,
    Panel,
    Select,
    SelectOptions,
    ModalLayout,
    ModalSize,
    useTheme,
} from '@chili-publish/grafx-shared-components';
import { useCallback, useMemo, useRef, useState } from 'react';
import { css } from 'styled-components';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import {
    DragHandleContainer,
    IconWrapper,
    TitleContainer,
    Container,
    OptionWithIcon,
    OptionText,
} from './ExportModal.styles';
import { useOutputSettingsContext } from '../OutputSettingsContext';
import { OutputSettingFormats, OutputSettings } from './ExportModal.types';

type SelectOptionType = SelectOptions & { item: OutputSettings };

interface ExportMenuProps {
    // config: InternalTemplateConfigType;
    isExportModalVisible: boolean;
    hideExportModalVisible: () => void;
}
const formatIconMappings: { [key in keyof typeof OutputSettingFormats]: AvailableIconsType } = {
    [OutputSettingFormats.JPG]: AvailableIcons.faImage,
    [OutputSettingFormats.PNG]: AvailableIcons.faImage,
    [OutputSettingFormats.MP4]: AvailableIcons.faFileVideo,
    [OutputSettingFormats.GIF]: AvailableIcons.faGif,
    [OutputSettingFormats.PDF]: AvailableIcons.faFilePdf,
};

function ExportModal({ isExportModalVisible, hideExportModalVisible }: ExportMenuProps) {
    const { outputSettingsFullList } = useOutputSettingsContext();

    const [selectedOption, setSelectedOption] = useState<string | number | null>();

    const { icon } = useTheme();
    const outputSettingsOptions = useMemo(
        () =>
            outputSettingsFullList?.map(
                (item) =>
                    ({
                        label: (
                            <OptionWithIcon height="2rem">
                                <Icon
                                    width="1rem"
                                    icon={formatIconMappings[item.type as unknown as keyof typeof formatIconMappings]}
                                />
                                <OptionText>
                                    <span>{item.name}</span>
                                    <span>{item.description}</span>
                                </OptionText>
                            </OptionWithIcon>
                        ),
                        item,
                        value: item.id,
                    } as unknown as SelectOptionType),
            ) || null,
        [outputSettingsFullList],
    );

    const closeMenu = useCallback(() => {
        hideExportModalVisible();
    }, [hideExportModalVisible]);

    // const exportDocument = useCallback(
    //     async (format: OutputSettingFormats, outputSetting: OutputSettings) => {
    //         if (!layoutId) return;
    //         const outputSettingDetailsUrl = `${config.graFxStudioEnvironmentApiBaseUrl}output/settings/${outputSetting.id}`;
    //         const outputSettingDetails = await axios.get(outputSettingDetailsUrl, {
    //             headers: { Authorization: `Bearer ${currentAuthToken}` },
    //         });
    //         closeMenu();
    //         dispatch(
    //             downloadDocument({
    //                 endpoint: config.graFxStudioEnvironmentApiBaseUrl,
    //                 token: currentAuthToken,
    //                 format,
    //                 layoutId,
    //                 taskType: outputSetting.id,
    //                 config: outputSettingDetails.data,
    //                 isDev,
    //             }),
    //         )
    //             .unwrap()
    //             .catch((err) => {
    //                 // eslint-disable-next-line no-console
    //                 console.error(err);
    //                 addNotification({
    //                     id: 'EXPORT_ERROR',
    //                     message: translateWidget('exportFailed'),
    //                     type: ToastVariant.NEGATIVE,
    //                 });
    //                 dispatch(clearBackgroundTask(outputSetting.id));
    //             });
    //     },
    //     [layoutId, config, currentAuthToken, closeMenu, dispatch, addNotification, translateWidget],
    // );

    // const handleExport = useCallback(() => {
    //     const selectedOutputSetting = outputSettings?.find((item) => item.id === selectedOption);
    //     if (!selectedOutputSetting) return;

    //     triggerMenuAction(selectedOutputSetting.id, () =>
    //         exportDocument(selectedOutputSetting?.type, selectedOutputSetting),
    //     );
    // }, [selectedOption, outputSettings, triggerMenuAction, exportDocument]);

    return (
        // <Modal
        //     anchorId="studio-ui-root-wrapper"
        //     id="export-menu-modal"
        //     key="export-menu-modal"
        //     dataId={getDataIdForSUI('export-menu-modal')}
        //     dataTestId={getDataTestIdForSUI('export-menu-modal')}
        //     isDismissible
        //     isDraggable
        //     dragHandleRef={ref}
        //     style={{
        //         width: '17.5rem',
        //         padding: 0,
        //         height: '11.4rem',
        //     }}
        //     isVisible={isExportModalVisible}
        //     onClose={closeMenu}
        //     backdropBackgroundColor="transparent"
        // >
        //     <Panel
        //         title={
        //             <TitleContainer>
        //                 Export
        //                 <DragHandleContainer ref={ref} />
        //             </TitleContainer>
        //         }
        //         rightIcon={
        //             <IconWrapper>
        //                 <Icon
        //                     dataId={getDataIdForSUI('export-modal-close-icon')}
        //                     dataTestId={getDataTestIdForSUI('export-modal-close-icon')}
        //                     icon={AvailableIcons.faXmark}
        //                     onClick={closeMenu}
        //                 />
        //             </IconWrapper>
        //         }
        //         key="export-panel"
        //         parentOverflow
        //         backgroundColor="var(--sw-base-background)"
        //     >
        //         <Container>
        //             {outputSettingsOptions ? (
        //                 <Select
        //                     id="output-dropdown"
        //                     selectIndicatorDataId="output-dropdown-chevron-icon"
        //                     placeholder="Output"
        //                     labelOnSide
        //                     label="Output"
        //                     dataId={getDataIdForSUI(`output-dropdown`)}
        //                     dataTestId={getDataTestIdForSUI(`output-dropdown`)}
        //                     defaultValue={outputSettingsOptions?.find((option) => option.value === selectedOption)}
        //                     options={outputSettingsOptions || []}
        //                     onChange={(option) => setSelectedOption(option?.value)}
        //                     // customValue={(option) => {
        //                     //     const item = (option as SelectOptionType).item;
        //                     //     return (
        //                     //         <OptionWithIcon>
        //                     //             <Icon icon={formatIconMappings[item.type]} color={icon.hover.color} />
        //                     //             <OptionText>
        //                     //                 <span>{item.name}</span>
        //                     //             </OptionText>
        //                     //         </OptionWithIcon>
        //                     //     );
        //                     // }}
        //                 />
        //             ) : (
        //                 <div style={{ height: '58px', width: '2rem' }} />
        //             )}
        //             <Button
        //                 dataId={getDataIdForSUI(`export-btn`)}
        //                 dataTestId={getDataTestIdForSUI(`export-btn`)}
        //                 // onClick={() => handleExport()}
        //                 onClick={() => console.log('expooorting')}
        //                 variant={ButtonVariant.primary}
        //                 label="To Run mode"
        //                 icon={<Icon key="export-btn-icon" icon={AvailableIcons.faArrowDownToLine} />}
        //                 // disabled={!outputSettings?.length}
        //                 styles={css`
        //                     width: 100%;
        //                 `}
        //             />
        //         </Container>
        //     </Panel>
        // </Modal>
        <ModalLayout.Container
            anchorId="studio-ui-root-wrapper"
            id="export-menu-modal"
            key="export-menu-modal"
            dataId={getDataIdForSUI('export-menu-modal')}
            dataTestId={getDataTestIdForSUI('export-menu-modal')}
            // isDismissible
            isDraggable
            size={ModalSize.ES}
            isVisible={isExportModalVisible}
            onClose={closeMenu}
        >
            <ModalLayout.Title>Export</ModalLayout.Title>
            <ModalLayout.Body>
                <Container>
                    {outputSettingsOptions ? (
                        <Select
                            id="output-dropdown"
                            selectIndicatorDataId="output-dropdown-chevron-icon"
                            placeholder="Output"
                            labelOnSide
                            label="Output"
                            dataId={getDataIdForSUI(`output-dropdown`)}
                            dataTestId={getDataTestIdForSUI(`output-dropdown`)}
                            defaultValue={outputSettingsOptions?.find((option) => option.value === selectedOption)}
                            options={outputSettingsOptions || []}
                            onChange={(option) => setSelectedOption(option?.value)}
                            fullDisplayOnOverflowParent
                            customValue={(option) => {
                                const { item } = option as SelectOptionType;
                                return (
                                    <OptionWithIcon>
                                        <Icon icon={formatIconMappings[item.type]} color={icon.hover.color} />
                                        <OptionText>
                                            <span>{item.name}</span>
                                        </OptionText>
                                    </OptionWithIcon>
                                );
                            }}
                        />
                    ) : (
                        <div style={{ height: '58px', width: '2rem' }} />
                    )}
                </Container>
            </ModalLayout.Body>
            <ModalLayout.Footer>
                <Button
                    dataId={getDataIdForSUI(`export-btn`)}
                    dataTestId={getDataTestIdForSUI(`export-btn`)}
                    // onClick={() => handleExport()}
                    onClick={() => console.log('expooorting')}
                    variant={ButtonVariant.primary}
                    label="To Run mode"
                    icon={<Icon key="export-btn-icon" icon={AvailableIcons.faArrowDownToLine} />}
                    // disabled={!outputSettings?.length}
                    styles={css`
                        width: 100%;
                    `}
                />
            </ModalLayout.Footer>
        </ModalLayout.Container>
    );
}

export default ExportModal;

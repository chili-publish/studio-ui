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
    useTheme,
} from '@chili-publish/grafx-shared-components';
import { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { css } from 'styled-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
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
import { APP_WRAPPER_ID } from '../../../utils/constants';

type SelectOptionType = SelectOptions & { item: OutputSettings };

interface ExportMenuProps {
    isExportModalVisible: boolean;
    hideExportModalVisible: () => void;
    handleExport: (
        downloadFormat: DownloadFormats,
        updateDownloadState: Dispatch<Partial<Record<DownloadFormats, boolean>>>,
        outputSettingsId: string | undefined,
    ) => Promise<void>;
    updateDownloadState: Dispatch<Partial<Record<DownloadFormats, boolean>>>;
    downloadState: Record<DownloadFormats, boolean>;
}
const formatIconMappings: { [key in keyof typeof OutputSettingFormats]: AvailableIconsType } = {
    [OutputSettingFormats.JPG]: AvailableIcons.faImage,
    [OutputSettingFormats.PNG]: AvailableIcons.faImage,
    [OutputSettingFormats.MP4]: AvailableIcons.faFileVideo,
    [OutputSettingFormats.GIF]: AvailableIcons.faGif,
    [OutputSettingFormats.PDF]: AvailableIcons.faFilePdf,
};

function ExportModal({
    isExportModalVisible,
    hideExportModalVisible,
    handleExport,
    updateDownloadState,
    downloadState,
}: ExportMenuProps) {
    const { outputSettingsFullList } = useOutputSettingsContext();
    const [selectedOption, setSelectedOption] = useState<string | number | null>();
    const ref = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        setSelectedOption(outputSettingsOptions ? outputSettingsOptions[0]?.value : null);
    }, [outputSettingsOptions]);

    return (
        <Modal
            anchorId={APP_WRAPPER_ID}
            id="export-menu-modal"
            key="export-menu-modal"
            dataId={getDataIdForSUI('export-menu-modal')}
            dataTestId={getDataTestIdForSUI('export-menu-modal')}
            isDismissible
            isDraggable
            dragHandleRef={ref}
            style={{
                width: '17.5rem',
                padding: 0,
                height: '11.4rem',
            }}
            isVisible={isExportModalVisible}
            onClose={closeMenu}
            backdropBackgroundColor="transparent"
        >
            <Panel
                title={
                    <TitleContainer>
                        <DragHandleContainer ref={ref} />
                        Export
                    </TitleContainer>
                }
                rightIcon={
                    <IconWrapper onClick={closeMenu}>
                        <Icon
                            dataId={getDataIdForSUI('export-modal-close-icon')}
                            dataTestId={getDataTestIdForSUI('export-modal-close-icon')}
                            icon={AvailableIcons.faXmark}
                        />
                    </IconWrapper>
                }
                key="export-panel"
                parentOverflow
                backgroundColor="var(--sw-base-background)"
            >
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
                            // eslint-disable-next-line react/no-unstable-nested-components
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
                    <Button
                        loading={Object.values(downloadState).some((value) => value === true)}
                        dataId={getDataIdForSUI(`export-btn`)}
                        dataTestId={getDataTestIdForSUI(`export-btn`)}
                        onClick={() => {
                            if (!Object.values(downloadState).some((value) => value === true)) {
                                const selectedOutputSetting = outputSettingsFullList?.find(
                                    (output) => output.id === selectedOption,
                                );
                                if (selectedOutputSetting) {
                                    handleExport(
                                        DownloadFormats[
                                            selectedOutputSetting.type as unknown as keyof typeof DownloadFormats
                                        ],
                                        updateDownloadState,
                                        selectedOutputSetting.id,
                                    );
                                }
                            }
                        }}
                        variant={ButtonVariant.primary}
                        label="To Run mode"
                        icon={<Icon key="export-btn-icon" icon={AvailableIcons.faArrowDownToLine} />}
                        disabled={!outputSettingsFullList?.length}
                        styles={css`
                            width: 100%;
                        `}
                    />
                </Container>
            </Panel>
        </Modal>
    );
}

export default ExportModal;

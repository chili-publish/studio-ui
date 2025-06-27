import {
    AvailableIcons,
    Button,
    ButtonVariant,
    Icon,
    Menu,
    Select,
    SelectOptions,
    Tray,
    useMobileSize,
    useTheme,
} from '@chili-publish/grafx-shared-components';
import { DownloadFormats } from '@chili-publish/studio-sdk';
import { Dispatch, RefObject, useMemo, useState } from 'react';
import { css } from 'styled-components';
import { useUITranslations } from '../../../core/hooks/useUITranslations';
import { UserInterfaceOutputSettings } from '../../../types/types';
import { APP_WRAPPER_ID } from '../../../utils/constants';
import { getDataIdForSUI, getDataTestIdForSUI } from '../../../utils/dataIds';
import StudioMobileDropdown from '../../shared/StudioMobileDropdown/StudioMobileDropdown';
import {
    BtnContainer,
    ButtonWrapper,
    Content,
    DesktopDropdownContainer,
    DownloadDropdownTitle,
    DownloadPanelContainer,
    SpinnerContainer,
} from './DownloadPanel.styles';
import { outputTypesIcons } from './DownloadPanel.types';
import DropdownOption from './DropdownOption';
import useDownload from './useDownload';
import { useDirection } from '../../../hooks/useDirection';

type SelectOptionType = SelectOptions & { item: UserInterfaceOutputSettings };

interface DownloadPanelProps {
    hideDownloadPanel: () => void;
    isDownloadPanelVisible: boolean;
    handleDownload: (
        _: DownloadFormats,
        __: Dispatch<Partial<Record<DownloadFormats, boolean>>>,
        outputSettingsId: string | undefined,
    ) => Promise<void>;
    isSandBoxMode?: boolean;
    exportButtonRef?: RefObject<HTMLLIElement | null>;
}

const getCustomSelectedLabel = (option: SelectOptions) => {
    const item = (option as SelectOptionType).item as UserInterfaceOutputSettings;
    const key = item.type.toLowerCase() as keyof typeof outputTypesIcons;
    return <DropdownOption iconData={outputTypesIcons[key]} text={item.name} description="" />;
};

const getCustomSelectedOption = (option?: SelectOptions) => {
    return option ? ({ label: getCustomSelectedLabel(option), value: option.value } as SelectOptions) : undefined;
};

function DownloadPanel(props: DownloadPanelProps) {
    const { hideDownloadPanel, isDownloadPanelVisible, handleDownload, isSandBoxMode, exportButtonRef } = props;
    const { direction } = useDirection();
    const isMobileSize = useMobileSize();
    const { themeColors } = useTheme();
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const {
        options,
        selectedValue,
        downloadPanelRef,
        downloadState,
        selectedOptionFormat,
        updateDownloadState,
        handleOutputFormatChange,
        selectedOutputSettingsId,
    } = useDownload({ hideDownloadPanel, isSandBoxMode });
    const { getUITranslation } = useUITranslations();

    const outputSelectorLabel = getUITranslation('toolBar', 'downloadButton', 'outputSelector', 'label') || 'Output';
    const DownloadButtonLabel =
        getUITranslation('toolBar', 'downloadButton', 'label') || isSandBoxMode ? 'Export' : 'Download';

    const downloadMenuRightOffset = useMemo(() => {
        if (exportButtonRef?.current) {
            return window.innerWidth - exportButtonRef.current.getBoundingClientRect().right;
        }
        return 9.875 * 16; // Default value
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exportButtonRef?.current]);

    return (
        <>
            <Tray
                isOpen={!!isMobileSize && isDownloadPanelVisible}
                anchorId={APP_WRAPPER_ID}
                close={() => {
                    hideDownloadPanel();
                    setMobileDropdownOpen(false);
                }}
                title={!mobileDropdownOpen && DownloadButtonLabel}
                styles={css`
                    ${mobileDropdownOpen ? 'padding: 0;' : 'padding-bottom: 1rem;'}
                    overflow: hidden;
                `}
                hideCloseButton={mobileDropdownOpen}
            >
                <Content borderTop={!mobileDropdownOpen}>
                    <StudioMobileDropdown
                        dataId={getDataIdForSUI(`output-dropdown`)}
                        label={outputSelectorLabel}
                        selectedValue={getCustomSelectedOption(selectedValue)}
                        options={options}
                        onChange={(val) => handleOutputFormatChange(val as typeof selectedOptionFormat)}
                        onMenuOpen={() => setMobileDropdownOpen(true)}
                        onMenuClose={() => setMobileDropdownOpen(false)}
                    />
                </Content>
                {!mobileDropdownOpen ? (
                    <ButtonWrapper>
                        {downloadState[selectedOptionFormat] ? (
                            <SpinnerContainer mobile>
                                <Button
                                    loading
                                    styles={css`
                                        width: 100%;
                                        background-color: ${themeColors.disabledElementsColor};
                                        &:hover {
                                            background-color: ${themeColors.disabledElementsColor};
                                        }
                                        transform: ${direction === 'rtl' ? 'scaleX(-1)' : 'scaleX(1)'};
                                    `}
                                />
                            </SpinnerContainer>
                        ) : (
                            <Button
                                dataId={getDataIdForSUI(`download-btn`)}
                                dataTestId={getDataTestIdForSUI(`download-btn`)}
                                onClick={() => {
                                    handleDownload(selectedOptionFormat, updateDownloadState, selectedOutputSettingsId);
                                }}
                                variant={ButtonVariant.primary}
                                label={DownloadButtonLabel}
                                icon={<Icon key={selectedOptionFormat} icon={AvailableIcons.faArrowDownToLine} />}
                                styles={css`
                                    width: 100%;
                                `}
                            />
                        )}
                    </ButtonWrapper>
                ) : null}
            </Tray>

            <Menu
                isVisible={!isMobileSize && isDownloadPanelVisible}
                onClose={() => undefined}
                position={
                    {
                        [direction === 'rtl' ? 'left' : 'right']: downloadMenuRightOffset,
                        top: 3.75 * 16,
                    } as unknown as DOMRect
                }
                style={{ width: 19 * 16 - 3 }}
                anchorId={APP_WRAPPER_ID}
            >
                <DownloadPanelContainer ref={downloadPanelRef}>
                    <DownloadDropdownTitle>{DownloadButtonLabel}</DownloadDropdownTitle>
                    <DesktopDropdownContainer>
                        <Select
                            label={outputSelectorLabel}
                            dataId={getDataIdForSUI(`output-dropdown`)}
                            dataTestId={getDataTestIdForSUI(`output-dropdown`)}
                            defaultValue={selectedValue}
                            options={options}
                            isSearchable={false}
                            width="16.25rem"
                            onChange={(option) =>
                                handleOutputFormatChange(option?.value as typeof selectedOptionFormat)
                            }
                            customValue={getCustomSelectedLabel}
                        />
                    </DesktopDropdownContainer>
                    {downloadState[selectedOptionFormat] ? (
                        <SpinnerContainer>
                            <Button
                                loading
                                styles={css`
                                    width: 100%;
                                    background-color: ${themeColors.disabledElementsColor};
                                    &:hover {
                                        background-color: ${themeColors.disabledElementsColor};
                                    }
                                    transform: ${direction === 'rtl' ? 'scaleX(-1)' : 'scaleX(1)'};
                                `}
                            />
                        </SpinnerContainer>
                    ) : (
                        <BtnContainer>
                            <Button
                                dataId={getDataIdForSUI(`download-btn`)}
                                dataTestId={getDataTestIdForSUI(`download-btn`)}
                                dataIntercomId="Download selected output"
                                onClick={() => {
                                    handleDownload(selectedOptionFormat, updateDownloadState, selectedOutputSettingsId);
                                }}
                                variant={ButtonVariant.primary}
                                label={DownloadButtonLabel}
                                icon={<Icon key={selectedOptionFormat} icon={AvailableIcons.faArrowDownToLine} />}
                                styles={css`
                                    margin-block: 1.25rem;
                                    margin-inline: auto;
                                    width: 100%;
                                `}
                            />
                        </BtnContainer>
                    )}
                </DownloadPanelContainer>
            </Menu>
        </>
    );
}

export default DownloadPanel;

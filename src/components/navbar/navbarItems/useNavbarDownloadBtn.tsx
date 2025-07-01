import { useMemo } from 'react';
import { AvailableIcons, ButtonVariant, useMobileSize } from '@chili-publish/grafx-shared-components';
import { useUITranslations } from '../../../core/hooks/useUITranslations';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import NavbarButton from '../../navbarButton/NavbarButton';
import { NavbarLabel } from '../Navbar.styles';
import { useUserInterfaceDetailsContext } from '../UserInterfaceDetailsContext';

const useNavbarDownloadBtn = (onDownloadPanelOpen: () => void, isSandBoxMode?: boolean) => {
    const { isDownloadBtnVisible } = useUiConfigContext();
    const { userInterfaceOutputSettings, outputSettingsFullList } = useUserInterfaceDetailsContext();
    const isMobile = useMobileSize();
    const { getUITranslation } = useUITranslations();

    const translatedLabel = getUITranslation(
        ['toolBar', 'downloadButton', 'label'],
        isSandBoxMode ? 'Export' : 'Download',
    );
    const label = translatedLabel || (isSandBoxMode ? 'Export' : 'Download');
    const isVisible = isSandBoxMode
        ? isDownloadBtnVisible
        : isDownloadBtnVisible && userInterfaceOutputSettings?.length !== 0;

    const navbarItem = useMemo(
        () =>
            isVisible
                ? {
                      label,
                      content: (
                          <NavbarButton
                              dataId="navbar-download-btn"
                              dataIntercomId="Download button"
                              ariaLabel={label}
                              label={
                                  !isMobile ? (
                                      <NavbarLabel key={label} hideOnMobile>
                                          {label}
                                      </NavbarLabel>
                                  ) : undefined
                              }
                              icon={AvailableIcons.faArrowDownToLine}
                              variant={ButtonVariant.primary}
                              handleOnClick={onDownloadPanelOpen}
                              disabled={
                                  isSandBoxMode
                                      ? outputSettingsFullList?.length === 0
                                      : userInterfaceOutputSettings?.length === 0
                              }
                          />
                      ),
                  }
                : null,
        [
            isMobile,
            isSandBoxMode,
            isVisible,
            label,
            onDownloadPanelOpen,
            outputSettingsFullList?.length,
            userInterfaceOutputSettings?.length,
        ],
    );

    return {
        downloadNavbarItem: navbarItem,
    };
};

export default useNavbarDownloadBtn;

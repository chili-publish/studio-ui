import { useMemo } from 'react';
import { AvailableIcons, ButtonVariant, useMobileSize } from '@chili-publish/grafx-shared-components';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import NavbarButton from '../../navbarButton/NavbarButton';
import { NavbarLabel } from '../Navbar.styles';
import { useOutputSettingsContext } from '../OutputSettingsContext';

const useNavbarDownloadBtn = (onDownloadPanelOpen: () => void, isSandBoxMode?: boolean) => {
    const { isDownloadBtnVisible } = useUiConfigContext();
    const { userInterfaceOutputSettings } = useOutputSettingsContext();
    const isMobile = useMobileSize();

    const label = isSandBoxMode ? 'Export' : 'Download';
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
                              disabled={userInterfaceOutputSettings?.length === 0}
                          />
                      ),
                  }
                : null,
        [isMobile, isVisible, label, onDownloadPanelOpen, userInterfaceOutputSettings?.length],
    );

    return {
        downloadNavbarItem: navbarItem,
    };
};

export default useNavbarDownloadBtn;

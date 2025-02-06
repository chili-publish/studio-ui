import { useMemo } from 'react';
import { AvailableIcons, ButtonVariant, useMobileSize } from '@chili-publish/grafx-shared-components';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import NavbarButton from '../../navbarButton/NavbarButton';
import { NavbarLabel } from '../Navbar.styles';
import { useOutputSettingsContext } from '../OutputSettingsContext';

const useNavbarDownloadBtn = (onDownloadPanelOpen: () => void) => {
    const { isDownloadBtnVisible } = useUiConfigContext();
    const { userInterfaceOutputSettings } = useOutputSettingsContext();
    const isMobile = useMobileSize();

    const navbarItem = useMemo(
        () =>
            isDownloadBtnVisible && userInterfaceOutputSettings?.length !== 0
                ? {
                      label: 'Download',
                      content: (
                          <NavbarButton
                              dataId="navbar-download-btn"
                              dataIntercomId="Download button"
                              ariaLabel="Download"
                              label={
                                  !isMobile ? (
                                      <NavbarLabel key="Download" hideOnMobile>
                                          Download
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
        [isDownloadBtnVisible, isMobile, onDownloadPanelOpen, userInterfaceOutputSettings?.length],
    );

    return {
        downloadNavbarItem: navbarItem,
    };
};

export default useNavbarDownloadBtn;

import { useMemo } from 'react';
import { AvailableIcons, ButtonVariant, useMobileSize } from '@chili-publish/grafx-shared-components';
import NavbarButton from '../../navbarButton/NavbarButton';
import { NavbarLabel } from '../Navbar.styles';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';

const useNavbarDownloadBtn = (onDownloadPanelOpen: () => void) => {
    const { isDownloadBtnVisible, userInterfaceOutputSettings } = useUiConfigContext();
    const isMobile = useMobileSize();

    const navbarItems = useMemo(
        () =>
            isDownloadBtnVisible && userInterfaceOutputSettings?.length !== 0
                ? [
                      {
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
                      },
                  ]
                : [],
        [isDownloadBtnVisible, isMobile, onDownloadPanelOpen, userInterfaceOutputSettings?.length],
    );

    return {
        downloadNavbarItems: navbarItems,
    };
};

export default useNavbarDownloadBtn;

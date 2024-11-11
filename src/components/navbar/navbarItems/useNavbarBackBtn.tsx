import { useMemo } from 'react';
import { AvailableIcons, useTheme } from '@chili-publish/grafx-shared-components';
import { NavbarGroup, NavbarText } from '../Navbar.styles';
import NavbarButton from '../../navbarButton/NavbarButton';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';

const useNavbarBackBtn = (projectName: string | undefined, onBackClick: (() => void) | undefined) => {
    const { isBackBtnVisible } = useUiConfigContext();
    const { mode } = useTheme();

    const navbarItem = useMemo(
        () =>
            isBackBtnVisible
                ? {
                      label: 'Project information',
                      content: (
                          <NavbarGroup>
                              <NavbarButton
                                  dataId="back-btn"
                                  dataTestId="back-btn"
                                  dataIntercomId="Go back button"
                                  ariaLabel="Go back"
                                  icon={AvailableIcons.faArrowLeft}
                                  handleOnClick={onBackClick || (() => null)}
                              />
                              <NavbarText aria-label={`Project: ${projectName}`} mode={mode}>
                                  {decodeURI(projectName || '')}
                              </NavbarText>
                          </NavbarGroup>
                      ),
                      styles: { marginRight: 'auto' },
                  }
                : null,
        [isBackBtnVisible, projectName, onBackClick, mode],
    );

    return {
        backBtnItem: navbarItem,
    };
};

export default useNavbarBackBtn;

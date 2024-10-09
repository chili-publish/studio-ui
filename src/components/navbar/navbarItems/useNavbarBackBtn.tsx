import { useMemo } from 'react';
import { AvailableIcons } from '@chili-publish/grafx-shared-components';
import { NavbarGroup, NavbarLabel } from '../Navbar.styles';
import NavbarButton from '../../navbarButton/NavbarButton';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';

const useNavbarBackBtn = (projectName: string | undefined, onBackClick: (() => void) | undefined) => {
    const { isBackBtnVisible } = useUiConfigContext();

    const navbarItems = useMemo(
        () =>
            isBackBtnVisible
                ? [
                      {
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
                                  <NavbarLabel aria-label={`Project: ${projectName}`}>
                                      {decodeURI(projectName || '')}
                                  </NavbarLabel>
                              </NavbarGroup>
                          ),
                      },
                  ]
                : [],
        [isBackBtnVisible, projectName, onBackClick],
    );

    return {
        backBtnItems: navbarItems,
    };
};

export default useNavbarBackBtn;

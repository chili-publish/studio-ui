import { useMemo } from 'react';
import { NavbarGroup, NavbarText } from '../Navbar.styles';
import NavbarButton from '../../navbarButton/NavbarButton';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import { useDirection } from '../../../hooks/useDirection';

const useNavbarBackBtn = (projectName: string | undefined, onBackClick: (() => void) | undefined) => {
    const { isBackBtnVisible } = useUiConfigContext();
    const { icons } = useDirection();

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
                                  icon={icons.back}
                                  handleOnClick={onBackClick || (() => null)}
                              />
                              <NavbarText aria-label={`Project: ${projectName}`}>
                                  {decodeURI(projectName || '')}
                              </NavbarText>
                          </NavbarGroup>
                      ),
                      styles: { marginInlineEnd: 'auto' },
                  }
                : null,
        [isBackBtnVisible, projectName, onBackClick, icons.back],
    );

    return {
        backBtnItem: navbarItem,
    };
};

export default useNavbarBackBtn;

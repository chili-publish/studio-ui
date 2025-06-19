import { useMemo } from 'react';
import { AvailableIcons } from '@chili-publish/grafx-shared-components';
import { NavbarGroup, NavbarText } from '../Navbar.styles';
import NavbarButton from '../../navbarButton/NavbarButton';
import { useUiConfigContext } from '../../../contexts/UiConfigContext';
import { useDirection } from '../../../hooks/useDirection';

const useNavbarBackBtn = (projectName: string | undefined, onBackClick: (() => void) | undefined) => {
    const { isBackBtnVisible } = useUiConfigContext();
    const { direction } = useDirection();

    const backIcon = direction === 'rtl' ? AvailableIcons.faArrowRight : AvailableIcons.faArrowLeft;

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
                                  icon={backIcon}
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
        [isBackBtnVisible, projectName, onBackClick, backIcon],
    );

    return {
        backBtnItem: navbarItem,
    };
};

export default useNavbarBackBtn;

import { showVariablesPanel } from 'src/store/reducers/panelReducer';
import { AvailableIcons, Button, ButtonVariant, Icon, useMobileSize } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { NavigationTitle, NavigationWrapper } from './ItemBrowser.styles';
import { useDirection } from '../../hooks/useDirection';
import { useAppDispatch } from '../../store';
import { useUITranslations } from '../../core/hooks/useUITranslations';

function ImagePanelTitle() {
    const { direction } = useDirection();
    const isMobileSize = useMobileSize();
    const dispatch = useAppDispatch();
    const { getUITranslation } = useUITranslations();

    return (
        <NavigationWrapper isMobile={isMobileSize}>
            <Button
                type="button"
                variant={ButtonVariant.tertiary}
                onClick={() => {
                    dispatch(showVariablesPanel());
                }}
                icon={<Icon icon={direction === 'rtl' ? AvailableIcons.faArrowRight : AvailableIcons.faArrowLeft} />}
                styles={css`
                    padding: 0;
                `}
            />
            <NavigationTitle className="navigation-path">
                {getUITranslation(['panels', 'media', 'title'], 'Select image')}
            </NavigationTitle>
        </NavigationWrapper>
    );
}

export default ImagePanelTitle;

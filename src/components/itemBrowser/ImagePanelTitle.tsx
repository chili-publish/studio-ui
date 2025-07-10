import { showVariablesPanel } from 'src/store/reducers/panelReducer';
import { AvailableIcons, Button, ButtonVariant, Icon } from '@chili-publish/grafx-shared-components';
import { css } from 'styled-components';
import { NavigationTitle, NavigationWrapper } from './ItemBrowser.styles';
import { useDirection } from '../../hooks/useDirection';
import { useAppDispatch } from '../../store';

function ImagePanelTitle() {
    const { direction } = useDirection();
    const dispatch = useAppDispatch();

    return (
        <NavigationWrapper>
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
            <NavigationTitle className="navigation-path">Select image</NavigationTitle>
        </NavigationWrapper>
    );
}

export default ImagePanelTitle;

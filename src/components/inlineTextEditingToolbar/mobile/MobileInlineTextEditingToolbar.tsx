import { AvailableIcons, Button, ButtonVariant, Icon, Tray } from '@chili-publish/grafx-shared-components';
import useTextEditingEnabled from '../_shared/useTextEditingEnabled';
import { ListViewTrayStyle, MobileToolbarWrapper, TrayTitle } from './MobileInlineTextEditingToolbar.styles';
import useTextEditingMobileViewTray, { TextEditingMobileViewTrayView } from './useTextEditingMobileViewTray';
import { getDataTestIdForSUI } from 'src/utils/dataIds';
import { APP_WRAPPER_ID } from 'src/utils/constants';
import MobileParagraphStyleConstraint from './paragraphStyleConstraint/MobileParagraphStyleConstraint';
import MobileCharacterStyleConstraint from './characterStyleConstraint/MobileCharacterStyleConstraint';
import MobileFontSizeConstraint from './fontSizeConstraint/MobileFontSizeConstraint';
import MobileColorConstraint from './colorConstraint/MobileColorConstraint';

const MobileInlineTextEditingToolbar = () => {
    const {
        frameConstraints,
        hasParagraphStyleConstraint,
        hasCharacterStyleConstraint,
        hasFontSizeConstraint,
        hasColorConstraint,
        hasTextEditingAllowed,
        textInEditMode,
    } = useTextEditingEnabled();

    const { currentView, isViewOpen, openView, closeView } = useTextEditingMobileViewTray();

    if (!hasTextEditingAllowed || !textInEditMode) {
        return null;
    }

    if (isViewOpen) {
        return (
            <Tray
                dataTestId={getDataTestIdForSUI('text-editing-mobile-view-tray')}
                isOpen
                anchorId={APP_WRAPPER_ID}
                close={closeView}
                title={currentView === TextEditingMobileViewTrayView.COLOR ? <TrayTitle>Color</TrayTitle> : ''}
                onTrayHidden={closeView}
            >
                {currentView === TextEditingMobileViewTrayView.PARAGRAPH_STYLE && (
                    <>
                        <ListViewTrayStyle />
                        <MobileParagraphStyleConstraint frameConstraints={frameConstraints} />
                    </>
                )}
                {currentView === TextEditingMobileViewTrayView.CHARACTER_STYLE && (
                    <>
                        <ListViewTrayStyle />
                        <MobileCharacterStyleConstraint frameConstraints={frameConstraints} />
                    </>
                )}
                {currentView === TextEditingMobileViewTrayView.FONT_SIZE && (
                    <MobileFontSizeConstraint frameConstraints={frameConstraints} />
                )}
                {currentView === TextEditingMobileViewTrayView.COLOR && (
                    <MobileColorConstraint frameConstraints={frameConstraints} />
                )}
            </Tray>
        );
    }
    return (
        <MobileToolbarWrapper data-testid={getDataTestIdForSUI('mobile-inline-text-editing-toolbar')}>
            {hasParagraphStyleConstraint && (
                <Button
                    dataTestId={getDataTestIdForSUI('paragraph-style-constraint-button')}
                    variant={ButtonVariant.tertiary}
                    icon={<Icon icon={AvailableIcons.faParagraph} />}
                    onClick={() => openView(TextEditingMobileViewTrayView.PARAGRAPH_STYLE)}
                />
            )}
            {hasCharacterStyleConstraint && (
                <Button
                    dataTestId={getDataTestIdForSUI('character-style-constraint-button')}
                    variant={ButtonVariant.tertiary}
                    icon={<Icon icon={AvailableIcons.faFont} />}
                    onClick={() => openView(TextEditingMobileViewTrayView.CHARACTER_STYLE)}
                />
            )}
            {hasFontSizeConstraint && (
                <Button
                    dataTestId={getDataTestIdForSUI('font-size-constraint-button')}
                    variant={ButtonVariant.tertiary}
                    icon={<Icon icon={AvailableIcons.faTextSize} />}
                    onClick={() => openView(TextEditingMobileViewTrayView.FONT_SIZE)}
                />
            )}
            {hasColorConstraint && (
                <Button
                    dataTestId={getDataTestIdForSUI('color-constraint-button')}
                    variant={ButtonVariant.tertiary}
                    icon={<Icon icon={AvailableIcons.faPalette} />}
                    onClick={() => openView(TextEditingMobileViewTrayView.COLOR)}
                />
            )}
        </MobileToolbarWrapper>
    );
};

export default MobileInlineTextEditingToolbar;

import { useMemo } from 'react';
import { AvailableIcons, Tooltip, TooltipPosition } from '@chili-publish/grafx-shared-components';
import { useDirection } from 'src/hooks/useDirection';
import { APP_WRAPPER_ID, REDO_BTN_ID, UNDO_BTN_ID } from '../../../utils/constants';
import { useUITranslations } from 'src/core/hooks/useUITranslations';
import NavbarButton from '../../navbarButton/NavbarButton';
import { NavbarGroup } from '../Navbar.styles';
import useUndoRedo from '../../../contexts/ShortcutManager/useUndoRedo';

const useNavbarUndoRedoItems = (undoStackState: { canRedo: boolean; canUndo: boolean }) => {
    const { handleUndo, handleRedo } = useUndoRedo(undoStackState);
    const { direction } = useDirection();
    const { getUITranslation } = useUITranslations();

    const undoIcon = direction === 'rtl' ? AvailableIcons.faArrowTurnDownRight : AvailableIcons.faArrowTurnDownLeft;
    const redoIcon = direction === 'rtl' ? AvailableIcons.faArrowTurnDownLeft : AvailableIcons.faArrowTurnDownRight;

    const navbarItem = useMemo(
        () => ({
            label: 'Actions',
            content: (
                <NavbarGroup withGap>
                    <Tooltip
                        content={getUITranslation(['toolBar', 'undoBtn', 'tooltip'], 'Undo')}
                        position={TooltipPosition.BOTTOM}
                        anchorId={APP_WRAPPER_ID}
                    >
                        <NavbarButton
                            dataId={UNDO_BTN_ID}
                            ariaLabel="Undo"
                            icon={undoIcon}
                            flipIconY
                            disabled={!undoStackState.canUndo}
                            handleOnClick={handleUndo}
                        />
                    </Tooltip>

                    <Tooltip
                        content={getUITranslation(['toolBar', 'redoBtn', 'tooltip'], 'Redo')}
                        position={TooltipPosition.BOTTOM}
                        anchorId={APP_WRAPPER_ID}
                    >
                        <NavbarButton
                            dataId={REDO_BTN_ID}
                            ariaLabel="Redo"
                            icon={redoIcon}
                            flipIconY
                            disabled={!undoStackState.canRedo}
                            handleOnClick={handleRedo}
                        />
                    </Tooltip>
                </NavbarGroup>
            ),
        }),
        [undoIcon, undoStackState.canUndo, undoStackState.canRedo, handleUndo, redoIcon, handleRedo, getUITranslation],
    );

    return {
        undoRedoNavbarItem: navbarItem,
    };
};

export default useNavbarUndoRedoItems;

import { useMemo } from 'react';
import { AvailableIcons, Tooltip, TooltipPosition } from '@chili-publish/grafx-shared-components';
import { useDirection } from 'src/hooks/useDirection';
import NavbarButton from '../../navbarButton/NavbarButton';
import { NavbarGroup } from '../Navbar.styles';
import useUndoRedo from '../../../contexts/ShortcutManager/useUndoRedo';

const useNavbarUndoRedoItems = (undoStackState: { canRedo: boolean; canUndo: boolean }) => {
    const { handleUndo, handleRedo } = useUndoRedo(undoStackState);
    const { direction } = useDirection();

    const undoIcon = direction === 'rtl' ? AvailableIcons.faArrowTurnDownRight : AvailableIcons.faArrowTurnDownLeft;
    const redoIcon = direction === 'rtl' ? AvailableIcons.faArrowTurnDownLeft : AvailableIcons.faArrowTurnDownRight;

    const navbarItem = useMemo(
        () => ({
            label: 'Actions',
            content: (
                <NavbarGroup withGap>
                    <Tooltip content={'Undo'} position={TooltipPosition.BOTTOM}>
                        <NavbarButton
                            dataId="undo-btn"
                            ariaLabel="Undo"
                            icon={undoIcon}
                            flipIconY
                            disabled={!undoStackState.canUndo}
                            handleOnClick={handleUndo}
                        />
                    </Tooltip>

                    <Tooltip content={'Redo'} position={TooltipPosition.BOTTOM}>
                        <NavbarButton
                            dataId="redo-btn"
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
        [undoIcon, undoStackState.canUndo, undoStackState.canRedo, handleUndo, redoIcon, handleRedo],
    );

    return {
        undoRedoNavbarItem: navbarItem,
    };
};

export default useNavbarUndoRedoItems;

import { useMemo } from 'react';
import { AvailableIcons } from '@chili-publish/grafx-shared-components';
import NavbarButton from '../../navbarButton/NavbarButton';
import { NavbarGroup } from '../Navbar.styles';
import useUndoRedo from '../../../contexts/ShortcutManager/useUndoRedo';

const useNavbarUndoRedoItems = (undoStackState: { canRedo: boolean; canUndo: boolean }) => {
    const { handleUndo, handleRedo } = useUndoRedo(undoStackState);

    const navbarItem = useMemo(
        () => ({
            label: 'Actions',
            content: (
                <NavbarGroup withGap>
                    <NavbarButton
                        dataId="undo-btn"
                        ariaLabel="Undo"
                        icon={AvailableIcons.faArrowTurnDownLeft}
                        flipIconY
                        disabled={!undoStackState.canUndo}
                        handleOnClick={handleUndo}
                    />
                    <NavbarButton
                        dataId="redo-btn"
                        ariaLabel="Redo"
                        icon={AvailableIcons.faArrowTurnDownRight}
                        flipIconY
                        disabled={!undoStackState.canRedo}
                        handleOnClick={handleRedo}
                    />
                </NavbarGroup>
            ),
        }),
        [undoStackState.canUndo, undoStackState.canRedo, handleUndo, handleRedo],
    );

    return {
        undoRedoNavbarItem: navbarItem,
    };
};

export default useNavbarUndoRedoItems;

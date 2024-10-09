import { useCallback, useMemo } from 'react';
import { AvailableIcons } from '@chili-publish/grafx-shared-components';
import NavbarButton from '../../navbarButton/NavbarButton';
import { NavbarGroup } from '../Navbar.styles';

const useNavbarUndoRedoItems = (undoStackState: { canRedo: boolean; canUndo: boolean }) => {
    const handleUndo = useCallback(() => {
        (async () => {
            if (undoStackState.canUndo) await window.SDK.undoManager.undo();
        })();
    }, [undoStackState.canUndo]);

    const handleRedo = useCallback(() => {
        (async () => {
            if (undoStackState.canRedo) await window.SDK.undoManager.redo();
        })();
    }, [undoStackState.canRedo]);

    const navbarItems = useMemo(
        () => [
            {
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
            },
        ],
        [undoStackState.canUndo, undoStackState.canRedo, handleUndo, handleRedo],
    );

    return {
        undoRedoNavbarItems: navbarItems,
    };
};

export default useNavbarUndoRedoItems;

import { Separator, ToolbarWrapper } from './InlineTextEditingToolbar.styles';
import ParagraphStyleConstraint from './paragraphStyleConstraint/ParagraphStyleConstraint';
import CharacterStyleConstraint from './characterStyleConstraint/CharacterStyleConstraint';
import ColorConstraint from './colorConstraint/ColorConstraint';
import FontSizeConstraint from './fontSizeConstraint/FontSizeConstraint';
import useTextEditingEnabled from '../_shared/useTextEditingEnabled';

const InlineTextEditingToolbar = () => {
    const {
        hasParagraphStyleConstraint,
        hasCharacterStyleConstraint,
        hasFontSizeConstraint,
        hasColorConstraint,
        hasTextEditingAllowed,
        textInEditMode,
        frameConstraints,
    } = useTextEditingEnabled();

    if (!hasTextEditingAllowed || !textInEditMode) {
        return null;
    }
    return (
        <ToolbarWrapper>
            {hasParagraphStyleConstraint && (
                <>
                    <ParagraphStyleConstraint frameConstraints={frameConstraints} />
                    <Separator />
                </>
            )}
            {hasCharacterStyleConstraint && (
                <>
                    <CharacterStyleConstraint frameConstraints={frameConstraints} />
                    <Separator />
                </>
            )}
            {hasFontSizeConstraint && (
                <>
                    <FontSizeConstraint frameConstraints={frameConstraints} />
                    <Separator />
                </>
            )}
            {hasColorConstraint && <ColorConstraint frameConstraints={frameConstraints} />}
        </ToolbarWrapper>
    );
};

export default InlineTextEditingToolbar;

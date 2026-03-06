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
                    {hasCharacterStyleConstraint || hasFontSizeConstraint || hasColorConstraint ? <Separator /> : null}
                </>
            )}
            {hasCharacterStyleConstraint && (
                <>
                    <CharacterStyleConstraint frameConstraints={frameConstraints} />
                    {hasFontSizeConstraint || hasColorConstraint ? <Separator /> : null}
                </>
            )}
            {hasFontSizeConstraint && (
                <>
                    <FontSizeConstraint frameConstraints={frameConstraints} />
                    {hasColorConstraint ? <Separator /> : null}
                </>
            )}
            {hasColorConstraint && <ColorConstraint frameConstraints={frameConstraints} />}
        </ToolbarWrapper>
    );
};

export default InlineTextEditingToolbar;

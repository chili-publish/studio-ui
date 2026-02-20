import { Separator, ToolbarWrapper } from './InlineTextEditingToolbar.styles';
import ParagraphStyleConstraint from './paragraphStyleConstraint/ParagraphStyleConstraint';
import CharacterStyleConstraint from './characterStyleConstraint/CharacterStyleConstraint';
import ColorConstraint from './colorConstraint/ColorConstraint';
import useFrameConstraints from './useFrameConstraints';
import { useAppSelector } from 'src/store';
import { selectedTextProperties } from 'src/store/reducers/frameReducer';
import FontSizeConstraint from './fontSizeConstraint/FontSizeConstraint';

const InlineTextEditingToolbar = () => {
    const { frameConstraints } = useFrameConstraints();
    const textProperties = useAppSelector(selectedTextProperties);

    const hasParagraphStyleConstraint = frameConstraints?.text?.paragraphStyles?.value.allowed;
    const hasCharacterStyleConstraint = frameConstraints?.text?.characterStyles?.value.allowed;
    const hasFontSizeConstraint = frameConstraints?.text?.fontSizes?.value.allowed;
    const hasColorConstraint = frameConstraints?.text?.colors?.value.allowed;
    const hasTextEditingAllowed = frameConstraints?.text?.textEditingAllowed.value;

    if (!hasTextEditingAllowed || !textProperties) {
        return null;
    }
    return (
        <ToolbarWrapper>
            {hasParagraphStyleConstraint && (
                <>
                    <ParagraphStyleConstraint
                        paragraphStyleIds={frameConstraints?.text?.paragraphStyles.value.ids ?? []}
                    />
                    <Separator />
                </>
            )}
            {hasCharacterStyleConstraint && (
                <>
                    <CharacterStyleConstraint
                        characterStyleIds={frameConstraints?.text?.characterStyles.value.ids ?? []}
                    />
                    <Separator />
                </>
            )}
            {hasFontSizeConstraint && (
                <>
                    <FontSizeConstraint
                        min={frameConstraints?.text?.fontSizes.value.min}
                        max={frameConstraints?.text?.fontSizes.value.max}
                    />
                    <Separator />
                </>
            )}
            {hasColorConstraint && <ColorConstraint colorIds={frameConstraints?.text?.colors.value.ids ?? []} />}
        </ToolbarWrapper>
    );
};

export default InlineTextEditingToolbar;

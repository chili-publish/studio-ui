import { useAppSelector } from 'src/store';
import { selectedFrameLayout, selectedTextProperties } from 'src/store/reducers/frameReducer';
import useFrameConstraints from './useFrameConstraints';

const useTextEditingEnabled = () => {
    const { frameConstraints } = useFrameConstraints();
    const textProperties = useAppSelector(selectedTextProperties);
    const selectedFrameLayoutData = useAppSelector(selectedFrameLayout);

    const hasCopyfitting = selectedFrameLayoutData?.enableCopyfitting?.value ?? false;

    const hasParagraphStyleConstraint = frameConstraints?.text?.paragraphStyles?.value.allowed;
    const hasCharacterStyleConstraint = frameConstraints?.text?.characterStyles?.value.allowed;
    const hasFontSizeConstraint = frameConstraints?.text?.fontSizes?.value.allowed && !hasCopyfitting;
    const hasColorConstraint = frameConstraints?.text?.colors?.value.allowed;

    const hasTextEditingAllowed =
        frameConstraints?.text?.editingAllowed.value &&
        (hasParagraphStyleConstraint || hasCharacterStyleConstraint || hasFontSizeConstraint || hasColorConstraint);

    return {
        frameConstraints,
        textInEditMode: !!textProperties,
        hasParagraphStyleConstraint,
        hasCharacterStyleConstraint,
        hasFontSizeConstraint,
        hasColorConstraint,
        hasTextEditingAllowed,
    };
};

export default useTextEditingEnabled;
